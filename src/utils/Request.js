import axios from 'axios'
import config from '../config';


// 本地存诸
const storage = window.localStorage;
// 从本地获取 Token
const getToken = () => 'Bearer ' + storage.getItem('scifanchain_access_token');

// 创建自定义 axios 实例
const instance = axios.create({
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
        'Authorization': getToken()
    }
})

instance.defaults.baseURL = config.API_URL;


let isRefreshing = false // 标记是否正在刷新 token
let requests = [] // 存储待重发请求的数组

// 响应拦截器
instance.interceptors.response.use(response => {
    return response
}, error => {
    if (!error.response) {
        return Promise.reject(error)
    }
    if ((error.response.status === 401 || error.response.status === 422) && !error.config.url.includes('/token/refresh/')) {
        const { config } = error
        if (!isRefreshing) {
            isRefreshing = true
            instance({
                url: 'api/token/refresh/',
                method: 'post',
                data: { 'refresh': storage.getItem('scifanchain_refresh_token')}
            }).then((res) => {       
                // 对返回的tokon解码
                // 将解码后的字符串转为json对象
                const payload = res.data.access.split('.')[1]
                const payloadJson = JSON.parse(window.atob(payload))

                // 删除旧令牌
                storage.removeItem('scifanchain_access_token');

                // 存储新令牌
                storage.scifanchain_access_token = res.data.access;
                // storage.scifanchain_refresh_token = res.data.refresh;
                storage.scifanchain_expired_time = payloadJson.exp;
                storage.scifanchain_user_id = payloadJson.user_id;

                config.headers.Authorization = `Bearer ${res.data.access}`
                // token 刷新后将数组中的方法重新执行
                console.log(requests)
                requests.forEach((cb) => cb(res.data.access))
                requests = [] // 重新请求完清空
                // window.location.reload()
                return instance(config)
            }).catch(err => {
                console.log(err)
                // window.location.href = "/sign-in/"
            }).finally(() => {
                isRefreshing = false
            })

        }
        else {
            // 返回未执行 resolve 的 Promise
            return new Promise(resolve => {
                // 用函数形式将 resolve 存入，等待刷新后再执行
                requests.push(token => {
                    config.headers.Authorization = `Bearer ${token}`
                    resolve(instance(config))
                })
            })
        }
    }
    return Promise.reject(error)
})


// 给请求头添加 access_token
const setHeaderToken = (isNeedToken) => {
    const access_token = isNeedToken ? getToken() : null
    if (isNeedToken) { // api 请求需要携带 access_token 
        if (!access_token) {
            console.log('不存在 access_token 跳转回登录页')
        }
        instance.defaults.headers.common.Authorization = access_token //注意：此处的 access_token 包含有Bearer
    }
}

// 多数get类型的 api 并不需要用户授权使用，则无需携带 access_token；默认不携带，需要则设置第三个参数为 true
export const get = (url, params = {}, isNeedToken = false) => {
    setHeaderToken(isNeedToken)
    return instance({
        method: 'get',
        url,
        params,
    })
}

// post 默认需要 Token
export const post = (url, params = {}, isNeedToken = true) => {
    setHeaderToken(isNeedToken)
    return instance({
        method: 'post',
        url,
        data: params,
    })
}

// post 默认需要 Token
export const put = (url, params = {}, isNeedToken = true) => {
    setHeaderToken(isNeedToken)
    return instance({
        method: 'put',
        url,
        data: params,
    })
}