import $axios from 'axios'
import { ZegoExpressEngine } from 'zego-express-engine-webrtc'

const appID = 1760679314
const server = 'wss://webliveroom-test.zego.im/ws'
const tokenUrl = 'https://wsliveroom-alpha.zego.im:8282/token'
const logUrl = 'wss://weblogger-test.zego.im/log'
const streamConfig = {
	videoQuality: 4, // 质量模式
	width: 1280, // 分辨率宽
	height: 720, // 分辨率高
	frameRate: 40, // 帧率
	bitrate: 4000, // 码率
	startBitrate: 'target', // 开始码率
	videoOptimizationMode: 'detail', // 视频优化模式
}
var zg = null
var localStream = {}
var remoteStream = {}
var info = {
	streamID: '',
	roomID: '',
	userID: '',
	userName: '',
	videoCodec: 'H264',
}

async function init (data) {
	console.log('开始初始化')
	Object.assign(info, data)
	zg = new ZegoExpressEngine(appID, server)
	console.warn(`version：${zg.getVersion()}`)
	zg.setLogConfig({
		logLevel: 'disable',
	})
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
		} else if (!result.videoCodec.H264 && !result.videoCodec.VP8) {
			// 浏览器不支持H264和VP8
			console.error('browser is not support H264 and VP8')
			return 'browser is not support H264 and VP8'
		} else if (!result.microphone) {
			// 浏览器不允许使用麦克风
			console.error('microphone not allowed to use')
			return 'microphones not allowed to use'
		} else if (!result.screenSharing) {
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
	console.log('正在登录：', info)
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
			return Promise.reject(err)
		}
	})
}

async function createVideoStream () {
	try {
		console.log('开始创建视频流')
		var { streamConfig, streamID } = info
		var stream = await zg.createStream({
			screen: {
				audio: true,
				...streamConfig,
			}
		})
		localStream.video = {
			id: streamID,
			stream,
		}
		console.warn('创建视频流成功：', stream)
		return Promise.resolve(stream)
	} catch (err) {
		console.error('创建视频流失败：', err)
		return Promise.reject(err)
	}
}

async function createAudioStream () {
	try {
		console.log('开始创建音频流')
		var { streamConfig, streamID } = info
		var stream = await zg.createStream({
			camera: {
				video: false,
				...streamConfig,
			},
		})
		localStream.audio = {
			id: `${streamID}audio`,
			stream,
		}
		console.warn('创建音频流成功：', stream)
		return Promise.resolve(stream)
	} catch (err) {
		console.error('创建音频流失败：', err)
		return Promise.reject(err)
	}
}

function startPublishingStream (isAudio) {
	try {
		var { videoCodec, streamID } = info
		var local = isAudio ? localStream.audio : localStream.video
		console.log('开始推流：', local.id)
		zg.startPublishingStream(local.id, local.stream, { videoCodec })
		console.warn('推流成功：', local.stream)
		return local.stream
	} catch (err) {
		console.error('推流失败：', err)
	}
}

async function startPlayingStream (streamID, isAudio) {
	try {
		console.log('开始拉流：', streamID)
		var stream = await zg.startPlayingStream(streamID)
		remoteStream[isAudio ? 'audio' : 'video'] = {
			id: streamID,
			stream,
		}
		console.warn('拉流成功：', stream)
		return stream
	} catch (err) {
		console.error('拉流失败：', err)
	}
}

function stopPublishingStream (isAudio) {
	var local = isAudio ? localStream.audio : localStream.video
	console.log('停止推流：', local.id)
	zg.stopPublishingStream(local.id)
	console.warn('停止推流成功')
}

function destroyStream (isAudio) {
	var local = isAudio ? localStream.audio : localStream.video
	console.log('销毁流：', local.id)
	zg.destroyStream(local.stream)
	console.warn('销毁成功')
}

function stopPlayingStream (isAudio) {
	var remote = isAudio ? remoteStream.audio : remoteStream.video
	console.log('停止拉流：', remote.id)
	zg.stopPlayingStream(remote.id)
	console.warn('停止拉流成功')
}

function logoutRoom () {
	console.log('登出房间：', info)
	var { roomID } = info
	if (localStream.audio) {
		stopPublishingStream(true)
		destroyStream(true)
	}
	if (localStream.video) {
		stopPublishingStream(false)
		destroyStream(false)
	}
	remoteStream.audio && stopPlayingStream(true)
	remoteStream.video && stopPlayingStream(false)
	zg.logoutRoom(roomID)
}

/*
	自定义消息（项目中用于自定义错误码）：
	0：客服端收到接入提示时点击挂断，提示客户端挂断
	...
*/
async function sendCustomCommand (userIdList, message) {
	console.log(`正在发送自定义信令 ${message} 给 ${userIdList.join(',')}`)
	var { roomID } = info
	try {
		const res =  await zg.sendCustomCommand(roomID, String(message), userIdList)
		console.warn('自定义信令发送成功：', res)
	} catch (err) {
		console.error('自定义信令发送失败：', err)
	}
}

export default {
	init, // 组件初始化
	loginRoom, // 登录房间
	createVideoStream, // 创建视频流
	createAudioStream, // 创建音频流
	startPublishingStream, // 开始推流
	startPlayingStream, // 开始拉流
	stopPublishingStream, // 停止拉流
	destroyStream, // 销毁流
	stopPlayingStream, // 停止推流
	logoutRoom, // 退出房间
	sendCustomCommand, // 发送自定义信令
}