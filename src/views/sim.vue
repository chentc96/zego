<template>
  <div class="service-page">
		<audio ref="audio" loop preload autoplay playsinline controls/>
		<button @click="logoutRoom">退出房间</button>
	</div>
</template>

<script>
import zego from '@/common/zego.js'
export default {
	name: 'Sim',
	data () {
		return {
			token: '',
			zg: null,
			info: {
				roomID: '5',
				streamID: '1',
				userID: '1',
				userName: '1',
			},
		}
	},
	created () {
		var { info } = this
		var { roomID, token } = this.$route.query
		zego.init(info)
		.then(zg => {
			this.zg = zg
			this.loginRoom()
		})
	},
	methods: {
		loginRoom () {
			zego.loginRoom()
			.then(() => {
				this.initEvent()
			})
		},
		logoutRoom: zego.logoutRoom,
		startPushStream () {
			var { info } = this
			zego.startPublishingStream(info.streamID)
			zego.startPublishingStream(`${info.streamID}audio`, true)
		},
		stopPushStream () {
			var { info } = this
			zego.stopPublishingStream(info.streamID)
			zego.stopPublishingStream(`${info.streamID}audio`)
		},
		startPullStream (streamID) {
			zego.startPlayingStream(streamID)
			.then(stream => {
				this.$refs.audio.srcObject = stream
			})
		},
		stopPullStream (vSID, aSID) {
			zego.stopPlayingStream(vSID)
			zego.stopPlayingStream(aSID)
		},
		updateRoom (data) {
			console.log('开始更新房间')
			var { roomID, userID, userName } = this.info
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
		initEvent () {
			var { zg } = this
			// 房间状态更新回调
			zg.on('roomStateUpdate', (roomID, state, errorCode) => {
				console.warn('roomStateUpdate：', state)
				if (state == 'CONNECTED') {
					// 与房间连接成功
					Promise.all([
						zego.createVideoStream(),
						zego.createAudioStream(),
					])
					.then(() => {
						this.startPushStream()
						this.updateRoom({
							count: 'add',
						})
					})
				} else if (state == 'DISCONNECTED') {
					// 与房间连接断开
					this.updateRoom({
						count: 'reduce',
						publish: 'false',
					})
				}
			})
			// 用户状态更新回调
			zg.on('roomUserUpdate', (roomID, updateType, userList) => {
				console.warn('roomUserUpdate：', updateType)
				console.log(userList)
				if (updateType === 'ADD') {
					// 用户新增
				} else if(updateType == 'DELETE') {
					// 用户减少
				}
			})
			// 流状态更新回调
			zg.on('roomStreamUpdate', async (roomID, updateType, streamList) => {
				console.warn('roomStreamUpdate：', updateType)
				console.log(streamList)
				if (updateType == 'ADD') {
					// 流新增
					this.startPullStream(streamList[0]['streamID'])
				} else if (updateType == 'DELETE') {
					// 流减少
					this.stopPullStream(streamList[0]['streamID'])
					this.updateRoom({
						count: 'reduce',
						room_id: roomID,
						user_id: streamList[0]['user']['userID'],
						user_name: streamList[0]['user']['userName'],
					})
				}
			})
			// 推流状态更新回调
			zg.on('publisherStateUpdate', ({ state }) => {
				console.warn('publisherStateUpdate：', state)
				if (state === 'PUBLISHING') {
					// 正在推流
					this.updateRoom({
						publish: 'true',
					})
				} else if (state === 'NO_PUBLISH') {
					// 未推流
				}
			})
			// 拉流状态更新回调
			zg.on('playerStateUpdate', ({ state }) => {
				console.warn('playerStateUpdate：', state)
				if (state === 'PLAYING') {
					// 正在拉流
				} else if (state === 'NO_PLAY') {
					// 未拉流
				}
			})
		},
	}
}
</script>

<style>

</style>
