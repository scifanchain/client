import { get, post } from './Request';


export function register(username, password, email) {
    post('http://127.0.0.1:8000/register/', {
        username: username,
        password: password,
        eamil: email
    }).then((res) => {
        console.log(res)

        // 对返回的tokon解码
        // 将解码后的字符串转为json对象
        const payload = res.data.access_token.split('.')[1]
        const payloadJson = JSON.parse(window.atob(payload))

        // 本地存储
        storage.scifanchain_username = username;
        storage.scifanchain_access_token = res.data.access_token;
        storage.scifanchain_refresh_token = res.data.refresh_token;
        storage.scifanchain_expired_time = payloadJson.exp;

        // 设置axios请求头
        // 注意Bearer后面需有空格
        axios.defaults.headers.common.Authorization = "Bearer " + access_token;

        // history.push('/sign-key');

    }).catch((err) => {
        console.log(err);
    });
};