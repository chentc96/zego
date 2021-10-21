import $axios from 'axios'
import $http from './http.js'
import { ZegoExpressEngine } from 'zego-express-engine-webrtc'

const appID = 1760679314
const server = 'wss://webliveroom-test.zego.im/ws'
const tokenUrl = 'https://wsliveroom-alpha.zego.im:8282/token'
const logUrl = 'wss://weblogger-test.zego.im/log'
const streamConfig = {
	videoQuality: 4, // 质量模式
	width: 1920, // 分辨率宽
	height: 1080, // 分辨率高
	frameRate: 30, // 帧率
	bitrate: 6000, // 码率
	startBitrate: 'target', // 开始码率
	videoOptimizationMode: 'detail', // 视频优化模式
}
var videoStream = null
var audioStream = null
var zg = null
var info = {
	client: false,
	streamID: '',
	roomID: '',
	userID: '',
	userName: '',
	videoCodec: 'VP8',
}

function init (data) {
	return new Promise((resolve, reject) => {
		Object.assign(info, data)
		zg = new ZegoExpressEngine(appID, server)
		checkSystem()
		.then(res => !res ?resolve(zg) :reject(flag))
	})
}

async function checkSystem () {
	console.log('开始检测')
	try {
		const result = await zg.checkSystemRequirements()
		console.warn('检测结果：', result)
		if (!result.webRTC) {
			// 浏览器不支持webrtc
			console.error('browser is not support webrtc')
			return 'browser is not support webrtc'
		}
		else if (!result.videoCodec.H264 && !result.videoCodec.VP8) {
			// 浏览器不支持H264和VP8
			console.error('browser is not support H264 and VP8')
			return 'browser is not support H264 and VP8'
		}
		// else if (!result.camera) {
		// 	// 浏览器不允许使用摄像头
		// 	console.error('camera not allowed to use')
		// 	return 'camera not allowed to use'
		// }
		// else if (!result.microphones) {
		// 	// 浏览器不允许使用麦克风
		// 	console.error('microphones not allowed to use')
		// 	return 'microphones not allowed to use'
		// }
		else if (!result.screenSharing) {
			// 浏览器不支持屏幕共享
			console.error('browser is not support screenSharing')
			return 'browser is not support screenSharing'
		}
		return false
	} catch (err) {
		console.error('检测失败：', err)
		return 'check failed'
	}
}

function loginRoom () {
	console.log('开始登录')
	var { roomID, userID, userName } = info
	$axios({
		url: tokenUrl,
		params: {
			app_id: appID,
			id_name: userID,
		}
	})
	.then(({ data }) => {
		try {
			zg.loginRoom(roomID, data, {
					userID,
					userName,
			}, {
				userUpdate: true,
			})
			initEvent()
			console.warn('登录成功')
		} catch (err) {
			console.error('登录失败：', err)
		}
	})
}

async function createVideoStream () {
	console.log('开始创建视频流')
	var { streamID, videoCodec, streamConfig } = info
	try {
		var stream = await zg.createStream({
			screen: {
				audio: true,
				...streamConfig,
			}
		})
		videoStream = stream
		console.warn('创建视频流成功：', stream)
		return stream
	} catch (err) {
		console.error('创建视频流成功：', err)
	}
}

async function createAudioStream () {
	console.log('开始创建音频流')
	var { streamID, streamConfig } = info
	try {
		var stream = await zg.createStream({
			camera: {
				video: false,
				...streamConfig,
			},
		})
		audioStream = stream
		console.warn('创建音频流成功：', stream)
		return stream
	} catch (err) {
		console.error('创建音频流失败：', err)
	}
}

function startPublishingStream (streamID, stream) {
	console.log('开始推流：', streamID)
	try {
		zg.startPublishingStream(streamID, stream)
		console.warn('推流成功：', stream)
		return stream
	} catch (err) {
		console.error('推流失败：', err)
	}
}

function stopPublishingStream (streamID, stream) {
	console.log('开始停止推流：', streamID)
	try {
		zg.stopPublishingStream(streamID, stream)
		console.warn('停止推流成功：', stream)
		return stream
	} catch (err) {
		console.error('停止推流失败：', err)
	}
}

async function startPlayingStream (streamID) {
	console.log('开始拉流：', streamID)
	try {
		var stream = await zg.startPlayingStream(streamID)
		console.warn('拉流成功：', stream)
		return stream
	} catch (err) {
		console.error('拉流失败：', err)
	}
}

function stopPlayingStream (streamID) {
	console.log('开始停止拉流：', streamID)
	try {
		zg.stopPlayingStream(streamID)
		console.warn('停止拉流成功')
	} catch (err) {
		console.error('停止拉流失败：', err)
	}
}

function updateRoom (data) {
	console.log('开始更新房间')
	var { roomID, userID, userName } = info
	$http.updateRoom({
		room_id: roomID,
		user_id: userID,
		user_name: userName,
		...data,
	})
	.then(({ data }) => {
		console.warn('更新房间：', data.msg)
	})
}

function logoutRoom () {
	var { roomID, streamID } = info
	zg.destroyStream(videoStream)
	zg.destroyStream(audioStream)
	zg.logoutRoom(roomID)
}

export default {
	init,
	loginRoom,
	createVideoStream,
	createAudioStream,
	startPublishingStream,
	stopPublishingStream,
	startPlayingStream,
	stopPlayingStream,
	updateRoom,
	logoutRoom,
}