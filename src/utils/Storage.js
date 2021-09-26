// 本地存储
const storage = window.localStorage;

export function SaveAuthorToken(props) {

    const {tokens, username} = props.data

    // 对返回的tokon解码
    // 将解码后的字符串转为json对象
    const payload = tokens.access.split('.')[1]
    const payloadJson = JSON.parse(window.atob(payload))

    storage.scifanchain_username = username;
    storage.scifanchain_user_id = payloadJson.user_id;
    storage.scifanchain_access_token = tokens.access;
    storage.scifanchain_refresh_token = tokens.refresh;
    storage.scifanchain_expired_time = payloadJson.exp;
}

export function RemoveAuthorToken() {
    storage.removeItem('scifanchain_username');
    storage.removeItem('scifanchain_user_id');
    storage.removeItem('scifanchain_access_token');
    storage.removeItem('scifanchain_refresh_token');
    storage.removeItem('scifanchain_expired_time');
}