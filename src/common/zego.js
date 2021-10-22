import $axios from 'axios'
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
	streamID: '',
	roomID: '',
	userID: '',
	userName: '',
	videoCodec: 'VP8',
}

async function init (data) {
	console.log('开始初始化')
	Object.assign(info, data)
	zg = new ZegoExpressEngine(appID, server)
	var result = await checkSystem()
	if (!result) {
		console.warn('初始化成功')
		return Promise.resolve(zg)
	}
	return Promise.reject(result)
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
		else if (!result.microphone) {
			// 浏览器不允许使用麦克风
			console.error('microphone not allowed to use')
			return 'microphones not allowed to use'
		}
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

async function loginRoom () {
	console.log('开始登录')
	var { roomID, userID, userName } = info
	await $axios({
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
			console.warn('登录成功')
			return Promise.resolve()
		} catch (err) {
			console.error('登录失败：', err)
			return Promise.reject()
		}
	})
}

async function createVideoStream () {
	console.log('开始创建视频流')
	var { streamConfig } = info
	try {
		var stream = await zg.createStream({
			screen: {
				audio: true,
				...streamConfig,
			}
		})
		videoStream = stream
		console.warn('创建视频流成功：', stream)
		return Promise.resolve(stream)
	} catch (err) {
		console.error('创建视频流失败：', err)
		return Promise.reject(stream)
	}
}

async function createAudioStream () {
	console.log('开始创建音频流')
	var { streamConfig } = info
	try {
		var stream = await zg.createStream({
			camera: {
				video: false,
				...streamConfig,
			},
		})
		audioStream = stream
		console.warn('创建音频流成功：', stream)
		return Promise.resolve(stream)
	} catch (err) {
		console.error('创建音频流失败：', err)
		return Promise.reject(stream)
	}
}

function startPublishingStream (streamID, isAudio) {
	var { videoCodec } = info
	var stream = isAudio ? audioStream : videoStream
	console.log('开始推流：', streamID)
	try {
		zg.startPublishingStream(streamID, stream, { videoCodec })
		console.warn('推流成功：', stream)
		return stream
	} catch (err) {
		console.error('推流失败：', err)
	}
}

function stopPublishingStream (streamID) {
	console.log('开始停止推流：', streamID)
	try {
		zg.stopPublishingStream(streamID)
		console.warn('停止推流成功')
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

function logoutRoom () {
	console.log('推出房间')
	var { roomID } = info
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
	logoutRoom,
}