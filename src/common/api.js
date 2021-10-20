var baseURL = 'https://test.vr.com:4433/'

export default {
	baseURL,
	getToken: `${baseURL}index/index/gettoken`, // 获取zg推拉流token
	room: `${baseURL}index/index/room`, // 获取房间列表
	verify: `${baseURL}index/index/verify`, // 验证房间状态获取身份信息
	updateRoom: `${baseURL}index/index/updateRoom`, // 更新房间状态
}