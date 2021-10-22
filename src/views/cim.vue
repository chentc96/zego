<template>
  <div class="cim-page">
		<tc-popup
			title="Leaving VR to watch Mine"
			msg="You will leave VR to watch Mine. Do you want to continue?"
			cancel="Hold On"
			confirm="Leave"
			v-model="show"
		/>
		<iframe v-show="!playing" :src="`/pano2vr/${mineID}/`"/>
		<video v-show="playing" ref="video" autoplay playsinline/>
		<audio ref="audio" loop preload autoplay playsinline controls hidden/>
		<div class="cim-main">
			<div>
				<tc-icons :image="require('@/assets/img/out.png')" size="38" space="8" :imageClass="{
					'border-radius': '50%',
				}">
					<div class="cim-main_info">
						<div>Jarry</div>
						<div>customer service</div>
					</div>
				</tc-icons>
			</div>
			<div>
				<tc-icons :image="require('@/assets/img/phone.png')" size="24" space="12">6004-952-760</tc-icons>
			</div>
			<div>
				<tc-icons :image="require('@/assets/img/select.png')" size="36" space="10">VR Watch</tc-icons>
			</div>
		</div>
	</div>
</template>

<script>
import zego from '@/common/zego.js'
export default {
	name: 'Cim',
	data () {
		return {
			show: false,
			playing: false,
			mineID: '1',
			token: '',
			zg: null,
			info: {
				streamID: '453',
				roomID: '5',
				userID: '453',
				userName: '1',
			},
		}
	},
	created () {
		var { info } = this
		var { mineID, token } = this.$route.query
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
			zego.startPublishingStream(`${info.streamID}audio`, true)
		},
		stopPushStream () {
			var { info } = this
			zego.stopPublishingStream(info.streamID)
			zego.stopPublishingStream(`${info.streamID}audio`)
		},
		startVideoStream (streamID) {
			zego.startPlayingStream(streamID)
			.then(stream => {
				this.$refs.video.srcObject = stream
				this.playing = true
			})
		},
		startAudioStream (streamID) {
			zego.startPlayingStream(streamID)
			.then(stream => {
				this.$refs.audio.srcObject = stream
			})
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
					zego.createAudioStream()
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
					streamList.forEach(item => {
						if (item.streamID.indexOf('audio') > -1) {
							this.startAudioStream(item.streamID)
						} else {
							this.startVideoStream(item.streamID)
						}
					})
				} else if (updateType == 'DELETE') {
					// 流减少
					streamList.forEach(item => {
						if (item.streamID.indexOf('audio') > -1) {
							zego.stopPlayingStream(item.streamID)
						} else {
							zego.stopPlayingStream(item.streamID)
						}
					})
				}
			})
			// 推流状态更新回调
			zg.on('publisherStateUpdate', ({ state }) => {
				console.warn('publisherStateUpdate：', state)
				if (state === 'PUBLISHING') {
					// 正在推流
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

<style lang="scss" scoped>
.cim-page {
	iframe,
	video {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
	}
	iframe {
		box-sizing: border-box;
	}
	video {
		background-color: #000;
	}
	.cim-main {
		display: flex;
		align-items: center;
		justify-content: space-between;
		box-sizing: border-box;
		padding: 10px 22px;
		position: absolute;
		left: 50%;
		bottom: 40px;
		transform: translateX(-50%);
		color: #FFF;
		background-color: rgba(0, 0, 0, 0.60);
		border: 6px solid rgba(255, 255, 255, 0.20);
		border-radius: 4px;
		min-width: 810px;
		.cim-main_info {
			& > div:first-child {
				font-family: SFUIDisplay, SFUIDisplay-Semibold;
				font-size: 18px;
				font-weight: 600;
			}
			& > div:last-child {
				font-family: SFUIDisplay, SFUIDisplay-Regular;
				font-size: 12px;
				opacity: 0.6;
			}
		}
		& > div:nth-child(1) {

		}
		& > div:nth-child(2),
		& > div:nth-child(3) {
			font-family: SFUIDisplay, SFUIDisplay-Regular;
			font-size: 18px;
		}
	}
}
</style>
