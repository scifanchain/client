import { useHistory } from 'react-router-dom'
import React, { Component, useState } from 'react'
import { Container, Grid, Form, Header, Message, Icon } from 'semantic-ui-react'
import axios from 'axios'
import qs from 'qs'
import { useRecoilState } from 'recoil'
import { usernameState } from '../StateManager'
import config from "../config"

const storage = window.localStorage;

function SignIn() {
    // 用户登录相关组件
    const [username, setUsername] = useRecoilState(usernameState)

    // 清空用户本地缓存
    storage.removeItem('scifanchain_username');
    storage.removeItem('scifanchain_access_token');
    storage.removeItem('scifanchain_refresh_token');
    setUsername('')

    const history = useHistory();

    const [state, setState] = useState({
        username: '',
        password: '',
        dissplay_hidden: true
    })

    function handleChange(evt) {
        setState({
            ...state,
            [evt.target.name]: evt.target.value,
        });
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        const loginInfo = {
            username: state.username,
            password: state.password
        };

        axios({
            // Oauth2要求必须以表单形式提交
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            method: 'post',
            url: config.API_URL + '/authors/login/',
            data: qs.stringify(loginInfo)
        }).then(response => {
            setUsername(state.username)
            const access_token = response.data.access_token;
            const refresh_token = response.data.refresh_token;
            axios.defaults.headers.common["Authorization"] = 'Bearer' + access_token;
            storage.scifanchain_username = state.username;
            storage.scifanchain_access_token = access_token;
            storage.scifanchain_refresh_token = refresh_token;
            history.push('/space');
        }).catch(err => {
            setState({ ...state, dissplay_hidden: false });
            console.log(err);
        });
    };

    return (

        <Container>
            <Grid>
                <Grid.Row>
                    <Grid.Column width={5}>
                    </Grid.Column>
                    <Grid.Column width={6}>
                        <Message
                            attached
                            header='赛凡链期待你的创造'
                        />
                        <Form onSubmit={handleSubmit} className='attached fluid segment'>
                            <Form.Input
                                placeholder='用户名'
                                name='username'
                                value={state.username}
                                onChange={handleChange}
                            />
                            <Form.Input
                                placeholder='密码'
                                name='password'
                                value={state.password}
                                type='password'
                                onChange={handleChange}
                            />
                            <Form.Button content='提交' />
                        </Form>
                        {!state.dissplay_hidden &&
                            <Message attached='bottom' warning>
                                <Icon name='help' />
                                用户名或密码不正确...&nbsp;<a href='#'>找回密码</a>。&nbsp;
                            </Message>
                        }
                    </Grid.Column>
                    <Grid.Column width={5}>
                    </Grid.Column>
                </Grid.Row>
            </Grid>
        </Container>
    )
}

export default SignIn