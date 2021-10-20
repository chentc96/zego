<template>
</template>

<script>
import { ZegoExpressEngine } from 'zego-express-engine-webrtc'
import { appID, server, tokenUrl, logUrl } from '@/common/KeyCenter.js'
const zg = new ZegoExpressEngine(appID, server)
export default {
	name: 'zego',
	props: {
		client: Boolean,
		streamID: String,
		roomID: String,
		userID: String,
		userName: String,
		videoCodec: {
			type: String,
			default: 'VP8'
		},
	},
	data () {
		return {
			videoStream: null,
			audioStream: null,
		}
	},
	created () {
		var { client } = this
		this.checkSystem()
		this.loginRoom()
	},
  methods: {
		initEvent () {
			var { client } = this
			// 房间状态更新回调
			zg.on('roomStateUpdate', (roomID, state, errorCode, extendedData) => {
				console.warn('roomStateUpdate：', state)
				if (state == 'CONNECTED') {
					// 与房间连接成功
					if (client) {
						this.createAudioStream()
					} else {
						this.createVideoStream()
						this.createAudioStream()
					}
					this.updateRoom({
						count: 'add',
					})
				} else if (state == 'DISCONNECTED') {
					// 与房间连接断开
					this.updateRoom({
						count: 'reduce',
						publish: false,
					})
				}
			})
			// 用户状态更新回调
			zg.on('roomUserUpdate', (roomID, updateType, userList) => {
				console.warn(
					`roomUserUpdate: room ${roomID}, user ${updateType}`,
					JSON.stringify(userList)
				)
			})
			// 流状态更新回调
			zg.on('roomStreamUpdate', async (roomID, updateType, streamList, extendedData) => {
				console.warn('roomStreamUpdate：', updateType)
				if (updateType == 'ADD') {
					// 流新增，开始拉流
					if (client) {
						this.startPlayingStream(streamList[0]['streamID'])
						this.startPlayingStream(streamList[1]['streamID'])
					} else {
						this.startPlayingStream(streamList[0]['streamID'])
					}
				} else if (updateType == 'DELETE') {
					// 流删除，停止拉流
					extendedData = JSON.parse(extendedData)
					if (!client) {
						this.updateRoom({
							count: 'reduce',
							room_id: roomID,
							user_id: streamList[0]['user']['userID'],
							user_name: streamList[0]['user']['userName'],
						})
					}
					this.stopPlayingStream(extendedData.stream_delete_reason[0].stream_id)
				}
			})
			// 推流状态更新回调
			zg.on('publisherStateUpdate', ({ state }) => {
				console.warn('publisherStateUpdate：', state)
				if (state === 'PUBLISHING') {
					// 正在推流
					console.warn('正在推流')
					if (!client) {
						this.updateRoom({
							publish: true,
						})
					}
				} else if (state === 'NO_PUBLISH') {
					// 未推流
				  console.error('未推流')
				}
			})
			// 拉流状态更新回调
			zg.on('playerStateUpdate', ({ state }) => {
				if (state === 'PLAYING') {
					// 正在拉流
					console.warn('正在拉流')
				} else if (state === 'NO_PLAY') {
					// 未拉流
					console.error('未拉流')
				}
			})
		},
		async checkSystem () {
			console.log('开始检测')
			try {
				const result = await zg.checkSystemRequirements()
				console.warn('检测结果：', result)
				if (!result.webRTC) {
					console.error('browser is not support webrtc')
					return false
				} else if (!result.videoCodec.H264 && !result.videoCodec.VP8) {
					console.error('browser is not support H264 and VP8')
					return false
				} else if (!result.camera && !result.microphones) {
					console.error('camera and microphones not allowed to use')
					return false
				} else if (!result.screenSharing) {
					console.error('browser is not support screenSharing')
					return false
				}
				return true
			} catch (err) {
				console.error('检测失败：', err)
				return false
			}
		},
		loginRoom () {
			console.log('开始登录')
			var { roomID, userID, userName } = this
			this.$axios({
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
					this.initEvent()
					console.warn('登录成功')
				} catch (err) {
					console.error('登录失败：', err)
				}
			})
		},
		async createVideoStream () {
			console.log('开始创建视频流')
			var { streamID, videoCodec } = this
			try {
				var stream = await zg.createStream({
					screen: {
						audio: true,
						width: 1920,
						height: 1080,
						frameRate: 120,
						bitrate: 6000,
					}
				})
				zg.startPublishingStream(streamID, stream, { videoCodec })
				this.videoStream = stream
				console.warn('创建视频流成功')
				return true
			} catch (err) {
				console.error('创建视频流成功：', err)
				return false
			}
		},
		async createAudioStream () {
			console.log('开始创建音频流')
			var { streamID } = this
			try {
				var stream = await zg.createStream({
					camera: {
						video: false,
						audio: true,
					},
				})
				zg.startPublishingStream(`${streamID}audio`, stream)
				this.audioStream = stream
				console.warn('创建音频流成功')
				return true
			} catch (err) {
				console.error('创建音频流失败：', err)
				return false
			}
		},
		async startPlayingStream (streamID) {
			console.log('开始拉流')
			try {
				var stream = await zg.startPlayingStream(streamID)
				this.$emit('start', stream)
				console.warn('拉流成功')
				return true
			} catch (err) {
				console.error('拉流失败：', err)
				return false
			}
		},
		stopPlayingStream (streamID) {
			zg.stopPlayingStream(streamID)
			this.$emit('stop')
		},
		updateRoom (data) {
			console.log('开始更新房间')
			var { roomID, userID, userName } = this
			this.$http.updateRoom({
				room_id: roomID,
				user_id: userID,
				user_name: userName,
				...data,
			})
			.then(({ data }) => {
				console.warn('更新房间：', data.msg)
			})
		},
		hangUp () {
			var { roomID, streamID, videoStream, audioStream } = this
			zg.stopPublishingStream(streamID)
			zg.destroyStream(videoStream)
			zg.destroyStream(audioStream)
			zg.logoutRoom(roomID)
		}
  }
}
</script>