// 本地存储
const storage = window.localStorage;

export function SaveAuthorToken(username, props) {
    const { access, refresh } = props

    // 对返回的tokon解码
    // 将解码后的字符串转为json对象
    const payload = access.split('.')[1]
    const payloadJson = JSON.parse(window.atob(payload))

    storage.setItem('scifanchain_username', username);
    storage.setItem('scifanchain_user_id', payloadJson.user_id);
    storage.setItem('scifanchain_access_token', access);
    storage.setItem('scifanchain_refresh_token', refresh);
    storage.setItem('scifanchain_expired_time', payloadJson.exp);
}

export function RemoveAuthorToken() {
    storage.removeItem('scifanchain_username');
    storage.removeItem('scifanchain_user_id');
    storage.removeItem('scifanchain_access_token');
    storage.removeItem('scifanchain_refresh_token');
    storage.removeItem('scifanchain_expired_time');
}

export function GetAuthorToken() {
    let author_token = {};
    const author = storage.getItem('scifanchain_user_id');
    if (!author) {
        return false;
    } else {
        author_token = {
            'username': storage.getItem('scifanchain_username'),
            'user_id': storage.getItem('scifanchain_user_id'),
            'access': storage.getItem('scifanchain_access_token'),
            'refresh': storage.getItem('scifanchain_refresh_token'),
            'exp': storage.getItem('scifanchain_expired_time')
        }
    }
    
    return author_token;
}