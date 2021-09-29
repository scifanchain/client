import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { Container, Grid, Form, Message, Icon } from 'semantic-ui-react';

import { useRecoilState } from 'recoil';
import { usernameState } from '../StateManager';

import { post } from '../utils/Request';

import { SaveAuthorToken, RemoveAuthorToken } from '../utils/Storage';


function SignIn() {
    const history = useHistory();
    // 用户登录相关组件
    const [username, setUsername] = useRecoilState(usernameState)

    const [state, setState] = useState({
        username: '',
        password: '',
        dissplay_hidden: true
    })

    useEffect(() => {
        // 清空用户本地缓存
        RemoveAuthorToken();
        setUsername('');

    })

    function handleChange(e) {
        setState({
            ...state,
            [e.target.name]: e.target.value,
        });
    }

    const handleSubmit = (e) => {
        e.preventDefault();

        post('api/token/', {
            username: state.username,
            password: state.password
        }).then(res => {
            setUsername(state.username)
            SaveAuthorToken(state.username, res.data);
            history.push('/space/profile');
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