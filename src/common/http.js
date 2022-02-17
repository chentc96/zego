import request from './request.js'
import $api from './api.js'

export default {
	roomInfo (params) {
		return request({
			url: $api.roomInfo,
			params,
		}, {
			hideLoad: true
		})
	},
	verify (params) {
		return request({
			url: $api.verify,
			params,
		})
	},
	updateRoom (data) {
		return request({
			url: $api.updateRoom,
			method: 'POST',
			data,
		})
	},
}