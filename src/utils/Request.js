import axios from 'axios'

axios.defaults.baseURL = 'http://127.0.0.1:8000/api/';


// 创建 axios 实例
const instance = axios.create({
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
    }
})

const storage = window.localStorage;

const getToken = () => 'Bearer ' + storage.getItem('scifanchain_access_token');

const setToken = (token) => {
    storage.removeItem('scifanchain_access_token');
    storage.scifanchain_access_token = token;
}

// 刷新 access_token 的接口
const refreshToken = () => {
    return instance({
        url: '/authors/refresh/',
        method: 'post',
        headers: {
            'Authorization': 'Bearer ' + storage.getItem('scifanchain_refresh_token')
        },
    })
}

let isRefreshing = false // 标记是否正在刷新 token
let requests = [] // 存储待重发请求的数组


// 响应拦截器
instance.interceptors.response.use(response => {
    return response
}, error => {
    if (!error.response) {
        return Promise.reject(error)
    }
    if ((error.response.status === 401 || error.response.status === 422) && !error.config.url.includes('/authors/refresh/')) {
        const { config } = error
        if (!isRefreshing) {
            isRefreshing = true
            return refreshToken().then(res => {
                const { access_token } = res.data
                console.log(access_token)
                setToken(access_token)
                config.headers.Authorization = `Bearer ${access_token}`
                // token 刷新后将数组中的方法重新执行
                console.log(requests)
                requests.forEach((cb) => cb(access_token))
                requests = [] // 重新请求完清空
                // window.location.reload()
                return instance(config)
            }).catch(err => {
                window.location.href = "/sign-in/"
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
            console.log('不存在 access_token 则跳转回登录页')
        }
        instance.defaults.headers.common.Authorization = access_token
    }
}

// 有些 api 并不需要用户授权使用，则无需携带 access_token；默认不携带，需要传则设置第三个参数为 true
export const get = (url, params = {}, isNeedToken = false) => {
    setHeaderToken(isNeedToken)
    return instance({
        method: 'get',
        url,
        params,
    })
}

export const post = (url, params = {}, isNeedToken = false) => {
    setHeaderToken(isNeedToken)
    return instance({
        method: 'post',
        url,
        data: params,
    })
}