import React, { Component } from 'react'
import {
    Button,
    Checkbox,
    Form,
    Input,
    Radio,
    Select,
    TextArea,
} from 'semantic-ui-react'
import axios from 'axios'
import qs from 'qs'


class FormExampleFieldControl extends Component {
    state = {title:'', 'content':''}

    handleChange = (e, { name, value }) => this.setState({ [name]: value })

    handleSubmit = e => {
        e.preventDefault();
        const { title, content } = this.state

        const submitData = {
            title: title,
            content: content,
            // grant_type: 'password'
        }

        let token = window.localStorage.getItem("scifanchain_access_token")
        axios.defaults.headers.common["Authorization"] = "Bearer " + token;

        axios({
            // Oauth2要求必须以表单形式提交
            // headers: {
            //     'Content-Type': 'application/x-www-form-urlencoded'
            // },
            headers: {
                'Content-Type': 'application/json',
            },
            method: 'post',
            url: 'https://api.scifanchain.com/stages/create_stage/',
            data: submitData
        }).then(response => {
            console.log(response)
            // console.log(response.data.refresh_token)
        }).catch(err => {
            console.log(err)
        });
    }

    render() {
        const { title, content } = this.state
        return (
            <Form onSubmit={this.handleSubmit}>
                <Form.Group widths='equal'>
                    <Form.Field
                        control={Input}
                        label='标题'
                        name='title'
                        placeholder='脑海中有一个想法...'
                        onChange={this.handleChange}
                    />
                </Form.Group>
                
                <Form.Field
                    control={TextArea}
                    label='内容'
                    name='content'
                    placeholder='把它写下来吧，让它生长...'
                    onChange={this.handleChange}
                />
                <Form.Field control={Button}>Submit</Form.Field>
            </Form>
        )
    }
}

export default FormExampleFieldControl