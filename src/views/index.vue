<template>
  <div>
		<video ref="video" autoplay playsinline/>
		<audio ref="audio" loop preload autoplay playsinline controls/><br><br>
		<button @click="loginRoom">登录房间</button><br><br>
		<button @click="createVideoStream">创建视频流</button><br><br>
		<button @click="createAudioStream">创建音频流</button><br><br>
		<button @click="startPublishingStream">推流</button><br><br>
		<button @click="stopPublishingStream">停止推流</button><br><br>
		<button @click="startPlayingStream">拉流</button><br><br>
		<button @click="stopPlayingStream">停止拉流</button><br><br>
		<button @click="logoutRoom">退出房间</button><br><br>
	</div>
</template>

<script>
import zego from '@/common/zego.js'
export default {
	name: 'Home',
	data () {
		return {
			info: {
				client: false,
				streamID: '1',
				roomID: '5',
				userID: '1',
				userName: '1',
			},
			videoStream: null,
			audioStream: null,
		}
	},
	mounted () {
		var { info } = this
		zego.init(info)
	},
	methods: {
		loginRoom: zego.loginRoom,
		logoutRoom: zego.logoutRoom,
		createVideoStream () {
			zego.createVideoStream()
			.then(stream => {
				this.videoStream = stream
			})
		},
		createAudioStream () {
			zego.createAudioStream()
			.then(stream => {
				this.audioStream = stream
			})
		},
		startPublishingStream () {
			var { videoStream, audioStream, info } = this
			zego.startPublishingStream(info.streamID, videoStream)
			zego.startPublishingStream(`${info.streamID}audio`, audioStream)
		},
		stopPublishingStream () {
			var { info } = this
			zego.stopPublishingStream(info.streamID)
			zego.stopPublishingStream(`${info.streamID}audio`)
		},
		startPlayingStream () {
			zego.startPlayingStream('453')
			.then(stream => {
				this.$refs.video.srcObject = stream
			})
			zego.startPlayingStream('453audio')
			.then(stream => {
				this.$refs.audio.srcObject = stream
			})
		},
		stopPlayingStream () {
			zego.stopPlayingStream('453')
			zego.stopPlayingStream('453audio')
		},
		initEvent (zg) {
			// 房间状态更新回调
			zg.on('roomStateUpdate', (roomID, state, errorCode, extendedData) => {
				console.warn('roomStateUpdate：', state)
				if (state == 'CONNECTED') {
					// 与房间连接成功
					if (client) {
						createAudioStream()
					} else {
						createVideoStream()
						createAudioStream()
					}
					updateRoom({
						count: 'add',
					})
				} else if (state == 'DISCONNECTED') {
					// 与房间连接断开
					updateRoom({
						count: 'reduce',
						publish: 'false',
					})
				}
			})
			// 用户状态更新回调
			zg.on('roomUserUpdate', (roomID, updateType, userList) => {
				console.warn('roomUserUpdate：', updateType)
				if (updateType === 'ADD') {
					// 用户新增
				} else if(updateType == 'DELETE') {
					// 用户减少
				}
			})
			// 流状态更新回调
			zg.on('roomStreamUpdate', async (roomID, updateType, streamList, extendedData) => {
				console.warn('roomStreamUpdate：', updateType)
				if (updateType == 'ADD') {
					// 流新增
					if (client) {
						startPlayingStream(streamList[0]['streamID'])
						startPlayingStream(streamList[1]['streamID'])
					} else {
						startPlayingStream(streamList[0]['streamID'])
					}
				} else if (updateType == 'DELETE') {
					// 流减少
					extendedData = JSON.parse(extendedData)
					if (!client) {
						updateRoom({
							count: 'reduce',
							room_id: roomID,
							user_id: streamList[0]['user']['userID'],
							user_name: streamList[0]['user']['userName'],
						})
					}
					stopPlayingStream(extendedData.stream_delete_reason[0].stream_id)
				}
			})
			// 推流状态更新回调
			zg.on('publisherStateUpdate', ({ state }) => {
				console.warn('publisherStateUpdate：', state)
				if (state === 'PUBLISHING') {
					// 正在推流
					console.warn('正在推流')
					if (!client) {
						updateRoom({
							publish: 'true',
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
		}
	}
}
</script>

<style>

</style>
