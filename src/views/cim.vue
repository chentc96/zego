<template>
  <div class="cim-page">
		<tc-popup
			:title="i18n.popup.title"
			:msg="i18n.popup.msg"
			:confirm="i18n.popup.confirm"
			:cancel="i18n.popup.cancel"
			v-model="show"
			@confirm="onLogin(false)"
		/>
		<audio ref="audio" loop preload autoplay playsinline controls hidden/>
		<video v-show="isPlay" ref="video" autoplay playsinline/>
		<vr v-show="!isPlay" :mineId="mineID"/>
		<div class="cim-main">
			<div v-if="!isLogin">
				<el-tooltip placement="top" v-model="showRoom">
				  <tc-icons
				  	:image="require('@/assets/img/view.png')"
				  	size="36" space="10"
				  >{{i18n.watch}}</tc-icons>
					<div slot="content">
						<tc-icons
							class="cim-list"
							v-for="(v, i) in roomList"
							:key="i"
							:disabled="v.status !== 1"
							:image="require('@/assets/img/serve.png')"
							size="40" align="bottom"
							@click="updateRoom(v)"
						>
							<div class="cim-list_item">
								<div>{{v.username}}</div>
								<div>{{v.language}}</div>
								<div :class="`status-${v.status}`">{{map.status[v.status]}}</div>
							</div>
						</tc-icons>
					</div>
				</el-tooltip>
			</div>
			<div v-if="isLogin && !isPlay">
				<tc-icons
					:image="require('@/assets/img/loading.gif')"
					size="24" space="12"
				>{{i18n.loading}}</tc-icons>
			</div>
			<div v-if="isPlay">
				<tc-icons
					:image="require('@/assets/img/serve.png')"
					size="38" space="8"
				>
					<div class="cim-main_info">
						<div>{{roomData.username}}</div>
						<div>{{roomData.language}}</div>
					</div>
				</tc-icons>
			</div>
			<div v-if="isPlay">
				<tc-icons
					:image="require('@/assets/img/phone.png')"
					size="24" space="12"
				>{{time | formatTime}}</tc-icons>
			</div>
			<div v-if="isLogin">
				<tc-icons
					:image="require('@/assets/img/leave.png')"
					size="24" space="10"
					@click="show = true"
				>{{i18n.leave}}</tc-icons>
			</div>
		</div>
	</div>
</template>

<script>
import zego from '@/common/zego.js'
import vr from './index.vue'
var timer = null
var refresh = true
export default {
	name: 'Cim',
	components: {
		vr,
	},
	data () {
		return {
			i18n: this.$t('cim'),
			map: this.$t('map'),
			zg: null,
			show: false,
			showRoom: false,
			isLogin: false,
			isPlay: false,
			token: '',
			mineID: '',
			time: 0,
			info: {},
			roomList: [],
			roomData: {},
		}
	},
	watch: {
		isPlay (n) {
			this.setInterval(n)
		},
		showRoom (n) {
			if (n && refresh) {
				refresh = false
				setTimeout(() => {
					refresh = true
				}, 3000)
				this.getRoomList()
			}
		},
	},
	created () {
		var { token, mineID } = this.$route.query
		this.token = token
		this.mineID = mineID
		this.getRoomList()
	},
	methods: {
		getRoomList () {
			console.log('开始获取房间列表')
			var { token, mineID } = this
			this.$http.roomInfo({
				mineId: mineID,
				customer_token: token,
			})
			.then(res => {
				this.roomList = res
			})
		},
		updateRoom (data) {
			console.log('开始进入房间')
			var { token } = this
			var roomID = data.id
			this.roomData = data
			return this.$http.updateRoom({
				count: 'add',
				roomId: roomID,
				customer_token: token,
			})
			.then(({ user }) => {
				var { userId, name } = user
				this.info = {
					roomID: String(roomID),
					streamID: String(userId),
					userID: String(userId),
					userName: name,
				}
				this.init()
			})
		},
		init () {
			var { info } = this
			zego.init(info)
			.then(res => {
				this.zg = res
				this.initEvent()
				this.onLogin(true)
			})
			.catch(err => {
				this.$message.error({
					message: err,
				})
			})
		},
		initEvent () {
			var { zg, i18n } = this
			zg.on('roomStateUpdate', (roomID, state, errorCode) => {
				console.warn('房间状态更新：', state)
				if (state === 'CONNECTED') {
					// 与房间连接成功
					zego.createAudioStream()
				}
			})
			zg.on('roomStreamUpdate', async (roomID, updateType, streamList) => {
				console.warn('流状态更新：', updateType)
				console.log(streamList)
				if (updateType === 'ADD') {
					// 流新增
					this.pullStream(streamList)
				} else if (updateType === 'DELETE') {
					// 流减少
					this.onLogin(false)
				}
			})
			zg.on('IMRecvCustomCommand', (roomID, fromUser, command) => {
				console.warn('收到自定义信令：', command)
				if (command == 0) {
					this.onLogin(false)
					this.$message.error({
						message: i18n.refuse,
					})
				}
			})
		},
		onLogin (flag) {
			this.isLogin = flag
			if (flag) {
				zego.loginRoom()
			} else {
				zego.logoutRoom()
				this.isPlay = false
			}
		},
		pullStream (streamList) {
			streamList.forEach((item, i) => {
				var { streamID } = item
				if (streamID.indexOf('audio') > -1) {
					zego.startPlayingStream(streamID, true)
					.then(stream => {
						this.$refs.audio.srcObject = stream
					})
				} else {
					zego.startPlayingStream(streamID, false)
					.then(stream => {
						zego.startPublishingStream(true)
						this.$refs.video.srcObject = stream
						this.isPlay = true
					})
				}
			})
		},
		setInterval (flag) {
			if (flag) {
				timer = setInterval(() => {
					this.time += 1
				}, 1000)
				return
			}
			clearInterval(timer)
			this.time = 0
		},
	}
}
</script>

<style lang="scss" scoped>
.cim-list {
	&:not(:last-child) {
		border-right: 1px solid;
		border-image: linear-gradient(rgba(255, 255, 255, 0) 0%, #FFF 50%, rgba(255, 255, 255, 0) 100%) 1 1;
	}
	.cim-list_item {
		font-family: SFUIDisplay, SFUIDisplay-Regular;
		text-align: center;
		font-size: 14px;
		line-height: 20px;
		padding: 0 16px;
		& > div:nth-child(1) {
			color: #CCC;
		}
		& > div:nth-child(2) {
			font-family: PingFangSC, PingFangSC-Semibold;
			color: #FFF;
			font-weight: 700;
		}
	}
}
.cim-page {
	iframe,
	video {
		position: fixed;
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
		position: fixed;
		left: 50%;
		bottom: 40px;
		transform: translateX(-50%);
		display: flex;
		align-items: center;
		justify-content: space-between;
		font-family: SFUIDisplay, SFUIDisplay-Regular;
		box-sizing: border-box;
		padding: 10px 0;
		color: #FFF;
		background-color: rgba(0, 0, 0, 0.60);
		border: 6px solid rgba(255, 255, 255, 0.20);
		border-radius: 4px;
		font-size: 18px;
		& > div {
			margin: 0 22px;
		}
		.cim-main_info {
			& > div:first-child {
				font-family: SFUIDisplay, SFUIDisplay-Semibold;
				font-weight: 600;
			}
			& > div:last-child {
				font-size: 12px;
				opacity: 0.6;
			}
		}
	}
}
</style>
