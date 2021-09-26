import React, { Component, useState, useEffect } from 'react'
import { useRecoilState } from 'recoil';
import { usernameState } from '../StateManager';

import {get, post} from '../utils/Request';


// 检查令牌
export function checkToken() {
    // 本地存储
    const storage = window.localStorage;

    // 同步用户
    const [username, setUsername] = useRecoilState(usernameState)

    const exp = parseInt(storage.getItem('scifanchain_expired_time'))
    const refresh = parseInt(storage.getItem('scifanchain_refresh_token'))
    const current_time = Date.parse(new Date()) / 1000;

    console.log(exp)
    console.log(current_time);

    // 刷新令牌
    const refreshToken = () => {
        axios({
            headers: {
                'Content-Type': 'application/json',
            },
            method: 'POST',
            url: 'token/refresh/',
            data: { 'refresh': refresh },
        }).then((response) => {
            console.log(response)
            const access_token = response.data.access;
            const refresh_token = response.data.refresh;

            // 对返回的tokon解码
            // 将解码后的字符串转为json对象
            const payload = access_token.split('.')[1]
            const payloadJson = JSON.parse(window.atob(payload))

            // 本地存储
            storage.scifanchain_access_token = access_token;
            storage.scifanchain_refresh_token = refresh_token;
            storage.scifanchain_expired_time = payloadJson.exp;

            // 设置axios请求头
            // 注意Bearer后面需有空格
            axios.defaults.headers.common['Authorization'] = "Bearer " + access_token;

        }).catch((err) => {
            console.log(err);
        });
    }


    // 用户注销
    const logout = () => {
        window.localStorage.removeItem('scifanchain_username');
        window.localStorage.removeItem('scifanchain_access_token');
        window.localStorage.removeItem('scifanchain_refresh_token');
        window.localStorage.removeItem('scifanchain_expired_time');
        setUsername('')
    }

    if (!exp || current_time > exp) {
        return false;
    }

    if (exp && (exp - current_time) < 1000) {
        // 刷新令牌
        refreshToken();
    }

    if (exp && current_time >= exp) {
        logout();
        return false;
    }

    return (
        <div>
            <p>goodddd</p>
        </div>
    );
}
