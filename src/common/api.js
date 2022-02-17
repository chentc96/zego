const host = window.location.hostname
var baseURL = 'https://kf.bitmineV3.vrapi.taobao.top/' // 开发环境
if (host.indexOf('bitmine') > -1) {
	baseURL = 'https://vr.api.bitmine.com/' // 正式环境
}
export default {
	baseURL,
	vr: `${baseURL}static/`, // vr预览地址
	roomInfo: `${baseURL}index/index/roominfo`, // 获取房间列表
	verify: `${baseURL}index/index/verify`, // 验证房间状态获取身份信息
	updateRoom: `${baseURL}index/index/updateroom`, // 更新房间状态
}