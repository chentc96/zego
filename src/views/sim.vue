<template>
  <div class="sim-page">
		<tc-popup
			:title="i18n.popup.title"
			:msg="i18n.popup.msg"
			:confirm="i18n.popup.confirm"
			:cancel="i18n.popup.cancel"
			v-model="show"
			@confirm="sendCommand(0)"
			@cancel="onAnswer"
		/>
		<audio ref="audio" loop preload autoplay playsinline controls hidden/>
		<div class="sim-header">
			<div class="sim-header_info">
				<div class="header-info_name">{{mineInfo.name}}</div>
				<div>
					<tc-icons :image="require('@/assets/img/pic.png')" size="36" space="10" :imageClass="{
						'border-radius': '50%',
					}">
						<div class="header-info_serve">
							<div>{{info.userName}}</div>
							<div class="status-0" v-if="!isLogin">{{map.status[0]}}</div>
							<div class="status-1" v-if="isLogin && !isPlay">{{map.status[1]}}</div>
							<div class="status-2" v-if="isLogin && isPlay">{{map.status[2]}}</div>
						</div>
					</tc-icons>
				</div>
				<!-- <div class="header-info_time">2021-10-12 12:15:00 至 2021-10-12 13:30:30</div> -->
			</div>
			<tc-icons
				:disabled="!zg || isPlay"
				:image="require('@/assets/img/login_on.png')"
				:imageOn="require('@/assets/img/login_off.png')"
				size="48" space="12" align="bottom"
				:value="isLogin"
				@click="onLogin"
			/>
		</div>
		<div class="sim-centre">
			<div class="sim-centre_state">{{i18n.duration}}</div>
			<div class="sim-centre_time">{{time | formatTime}}</div>
			<div class="sim-centre_audio">
				<el-image :src="require('@/assets/img/audio.png')" fit="contain"/>
			</div>
			<div class="sim-centre_active">
				<tc-icons
					:disabled="!isPlay"
					:image="require('@/assets/img/connect_off.png')"
					size="56" space="12" align="bottom"
					@click="pushStream(false)"
				>{{i18n.hangup}}</tc-icons>
				<tc-icons
					:disabled="!isPlay"
					:image="require('@/assets/img/voice_off.png')"
					:imageOn="require('@/assets/img/voice_on.png')"
					size="48" space="12" align="bottom"
					v-model="isMute"
					@click="onMute"
				>{{i18n.mute}}</tc-icons>
			</div>
		</div>
		<div class="sim-footer">
			<!-- <div class="sim-footer_time">常看次数：<span>120</span> 平均时长：<span>30分钟</span></div> -->
			<div class="sim-footer_list">
				<el-table :data="custList" height="280" border :header-cell-style="{ backgroundColor: '#EEE' }" :empty-text="tips.noData">
					<el-table-column label="No." type="index" width="80" align="center"/>
					<el-table-column v-for="(v, k, i) in i18n.rowData" :key="i" :prop="k" :label="v" align="center"/>
				</el-table>
			</div>
			<!-- <div class="sim-footer_tips">备注：若用户自己退出VR带看，则系统自动保存语音（格式为：客户ID+进入房间时间）到客服的统计数据列表中</div> -->
		</div>
	</div>
</template>

<script>
import zego from '@/common/zego.js'
var timer = null
export default {
	name: 'Sim',
	data () {
		return {
			i18n: this.$t('sim'),
			tips: this.$t('tips'),
			map: this.$t('map'),
			zg: null,
			show: false,
			isLogin: false,
			isPlay: false,
			isMute: false,
			token: '',
			time: 0,
			startTime: 0,
			endTime: 0,
			info: {},
			custInfo: {},
			mineInfo: {},
			custList: [],
		}
	},
	watch: {
		isPlay (n) {
			this.setInterval(n)
		},
	},
	created () {
		var { token, roomID } = this.$route.query
		this.token = token
		this.verify(roomID)
		window.onbeforeunload = () => {
			window.event.returnValue = ''
			this.sendCommand(0)
			this.onLogin(false)
			this.updateRoom({
				count: 'reduce',
				publish: 'false',
			})
		}
	},
	methods: {
		verify (roomID) {
			console.log('开始校验信息')
			var { token } = this
			this.$http.verify({
				room_id: roomID,
				token,
			})
			.then(({ user, mine }) => {
				var { id, name } = user
				this.mineInfo = mine
				this.info = {
					roomID,
					streamID: id,
					userID: id,
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
					zego.createVideoStream()
					.then(() => {
						zego.createAudioStream()
						this.updateRoom({
							count: 'add',
							publish: 'true',
						})
					})
					.catch(() => {
						this.sendCommand(0)
						this.onLogin(false)
					})
				} else if (state === 'DISCONNECTED') {
					// 与房间断开了连接
					this.updateRoom({
						count: 'reduce',
						publish: 'false',
					})
				}
			})
			zg.on('roomStreamUpdate', async (roomID, updateType, streamList) => {
				console.warn('流状态更新：', updateType)
				console.log(streamList)
				if (updateType === 'ADD') {
					// 流新增
					this.pullStream(streamList, true)
				} else if (updateType === 'DELETE') {
					// 流减少
					this.pullStream(streamList, false)
				}
			})
			zg.on('roomUserUpdate', (roomID, updateType, userList) => {
				console.warn('用户状态更新：', updateType)
				console.log(userList)
				var userInfo = userList[0]
				if (updateType === 'ADD') {
					// 用户新增
					this.custInfo = userInfo
					this.show = true
				} else if (updateType === 'DELETE') {
					// 用户减少
					this.pushStream(false)
					this.updateRoom({
						count: 'reduce',
						user_id: userInfo.userID,
						user_name: userInfo.userName,
					})
					this.custInfo = {}
				}
			})
		},
		onLogin (flag) {
			this.isLogin = flag
			flag
				? zego.loginRoom()
				: zego.logoutRoom()
		},
		onAnswer () {
			var { custInfo, i18n } = this
			if (!custInfo.userID) {
				this.$message.error({
					message: i18n.leave,
				})
				return
			}
			this.pushStream(true)
		},
		onMute (flag) {
			var { zg } = this
			zg.muteMicrophone(flag)
		},
		pullStream (streamList, flag) {
			streamList.forEach((item, i) => {
				var { streamID } = item
				if (flag) {
					zego.startPlayingStream(streamID, true)
					.then(stream => {
						this.$refs.audio.srcObject = stream
						this.startTime = new Date().getTime()
						this.isPlay = true
					})
				} else {
					zego.stopPlayingStream(true)
					this.$refs.audio.srcObject = null
					this.endTime = new Date().getTime()
					this.isPlay = false
					this.isMute = false
				}
			})
		},
		pushStream (flag) {
			if (flag) {
				zego.startPublishingStream(false)
				zego.startPublishingStream(true)
			} else {
				zego.stopPublishingStream(false)
				zego.stopPublishingStream(true)
			}
		},
		updateRoom (data) {
			console.log('开始更新房间')
			var { token } = this
			var { roomID, userID, userName } = this.info
			return this.$http.updateRoom({
				room_id: roomID,
				user_id: userID,
				user_name: userName,
				...data,
				token,
			})
		},
		sendCommand (code) {
			var { custInfo } = this
			this.show = false
			custInfo.userID && zego.sendCustomCommand([custInfo.userID], code)
		},
		setInterval (flag) {
			if (flag) {
				timer = setInterval(() => {
					this.time += 1
				}, 1000)
				return
			}
			clearInterval(timer)
			this.setData()
			this.time = 0
		},
		setData () {
			var { custInfo, startTime, endTime, time } = this
			this.custList.push({
				...custInfo,
				start: this.$filter.formatDate(startTime),
				end: this.$filter.formatDate(endTime),
				stay: this.$filter.formatTime(time),
			})
		},
	}
}
</script>

<style lang="scss" scoped>
.sim-page {
	.sim-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		background-color: #FFF;
		border: 1px solid #EEE;
		box-shadow: 0 12px 12px 0px rgba(0, 0, 0, 0.05);
		padding: 14px 30px 20px 24px;
		.sim-header_info {
			& > div:not(:last-child) {
				margin-bottom: 10px;
			}
			.header-info_name {
				font-family: SFUIDisplay, SFUIDisplay-Bold;
				font-size: 18px;
				font-weight: 700;
				color: #1f1f1f;
			}
			.header-info_serve {
				line-height: 26px;
				& > div:first-child {
					font-family: SFUIDisplay, SFUIDisplay-Bold;
					font-size: 18px;
					font-weight: 700;
					color: #1D1D1D;
				}		
			}
			.header-info_time {
				font-family: SFUIDisplay, SFUIDisplay-Regular;
				font-size: 14px;
				color: #757575;
			}
		}
	}
	.sim-centre {
		text-align: center;
		padding: 62px 22px 22px;
		.sim-centre_state {
			font-family: PingFangSC, PingFangSC-Semibold;
			font-size: 14px;
			font-weight: 600;
			color: #1D1D1D;
		}
		.sim-centre_time {
			font-family: SFUIDisplay, SFUIDisplay-Bold;
			font-size: 18px;
			font-weight: 700;
			color: #1E9FFF;
		}
		.sim-centre_audio {
			margin: 22px 0 30px;
			padding: 10px 60px;
			background-color: #F7F7F7;
			border: 1px solid #EEE;
			border-radius: 4px;
		}
		.sim-centre_active {
			font-family: PingFangSC, PingFangSC-Regular;
			font-size: 14px;
			color: #757575;
			& > div {
				margin: 0 10px;
			}
		}
	}
	.sim-footer {
		padding: 0 24px;
		.sim-footer_time {
			font-family: PingFangSC, PingFangSC-Regular;
			font-size: 14px;
			color: #8B8B8B;
			span {
				color: #1F1F1F;
				font-weight: bold;
			}
		}
		.sim-footer_list {
			background-color: #EEE;
			margin: 10px 0;
		}
		.sim-footer_tips {
			font-family: PingFangSC, PingFangSC-Regular;
			font-size: 14px;
			color: #757575;
		}
	}
}
</style>
