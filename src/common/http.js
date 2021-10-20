import axios from 'axios'
import $api from '@/common/api.js'

export default {
	getToken (params) {
		return axios({
			url: $api.getToken,
			method: 'POST',
			params,
		})
	},
	room (params) {
		return axios({
			url: $api.room,
			method: 'POST',
			params,
		})
	},
	verify (params) {
		return axios({
			url: $api.verify,
			method: 'GET',
			params,
		})
	},
	updateRoom (data) {
		return axios({
			url: $api.updateRoom,
			method: 'POST',
			data,
		})
	},
}