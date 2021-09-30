import React, { useEffect, useState } from 'react';
import { Switch, Route, Link } from 'react-router-dom';
import { Header } from 'semantic-ui-react';

import { get } from '../utils/Request';


export default function Profile() {
    const storage = window.localStorage;
    const [author, setAuthor] = useState({})

    useEffect(() => {
        get('api/users/' + storage.getItem('scifanchain_username'), {}, true)
            .then((res) => {
                console.log(res);
                setAuthor(res.data);
            })
    }, [])

    return (
        <div>
            <Header>个人资料</Header>
            <div>用户名：{ author.username}</div>
            <div>邮箱：{ author.email}</div>
        </div>
    )
}