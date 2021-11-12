import axios from 'axios'
import { Loading, Message } from 'element-ui'
var loading = null
const request = axios.create({
  timeout: 20000,
})

// 添加请求拦截器
request.interceptors.request.use((config) => {
	// 请求前
	return config
}, (err) => {
	// 请求错误
	loading && loading.close()
	Message.error({
		message: 'Request Error！',
	})
	return Promise.reject(err)
})

// 添加响应拦截器
request.interceptors.response.use(res => {
	// 响应数据
	loading && loading.close()
	var { code, data, msg } = res.data
	if (code === 200) return data
	window.parent.postMessage(res.data, '*')
	Message.error({
		message: msg,
	})
	return Promise.reject(msg)
}, (err) => {
	// 响应错误
	loading && loading.close()
	Message.error({
		message: 'Request Failed！',
	})
	return Promise.reject(err)
})

export default function (data, attr = {}) {
	if (!attr.hideLoad) {
		loading = Loading.service({
			background: 'rgba(0, 0, 0, 0.2)',
		})
	}
	return request(data)
}