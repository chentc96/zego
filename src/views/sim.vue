<template>
  <div class="sim-page">
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
							<div>
								<el-tag v-if="isLogin" type="success" size="mini">Online</el-tag>
								<el-tag v-else type="danger" size="mini">Offline</el-tag>
							</div>
						</div>
					</tc-icons>
				</div>
				<!-- <div class="header-info_time">2021-10-12 12:15:00 至 2021-10-12 13:30:30</div> -->
			</div>
			<tc-icons
				:disabled="!zg"
				:image="require('@/assets/img/login_on.png')"
				:imageOn="require('@/assets/img/login_off.png')"
				size="48" space="12" align="bottom"
				:value="isLogin"
				@click="onLogin"
			/>
		</div>
		<div class="sim-centre">
			<div class="sim-centre_state">Call Duration</div>
			<div class="sim-centre_time">{{time | formatTime}}</div>
			<div class="sim-centre_audio">
				<el-image :src="require('@/assets/img/audio.png')" fit="contain"/>
			</div>
			<div class="sim-centre_active">
				<tc-icons
					:disabled="!streamList.length"
					:image="require('@/assets/img/connect_on.png')"
					:imageOn="require('@/assets/img/connect_off.png')"
					size="56" space="12" align="bottom"
					:value="isPlay"
					@click="onPlay"
				>{{isPlay ? 'Hang Up' :'Answer'}}</tc-icons>
				<tc-icons
					:disabled="!isPlay"
					:image="require('@/assets/img/voice_off.png')"
					:imageOn="require('@/assets/img/voice_on.png')"
					size="48" space="12" align="bottom"
					v-model="isMute"
					@click="onMute"
				>Mute</tc-icons>
			</div>
		</div>
		<div class="sim-footer">
			<!-- <div class="sim-footer_time">常看次数：<span>120</span> 平均时长：<span>30分钟</span></div> -->
			<div class="sim-footer_list">
				<el-table :data="userList" height="280" border :header-cell-style="{ backgroundColor: '#EEE' }" empty-text="No Data">
					<el-table-column label="No." type="index" width="80" align="center"/>
					<el-table-column v-for="(v, k, i) in rowData" :key="i" :prop="k" :label="v" align="center"/>
				</el-table>
			</div>
			<!-- <div class="sim-footer_tips">备注：若用户自己退出VR带看，则系统自动保存语音（格式为：客户ID+进入房间时间）到客服的统计数据列表中</div> -->
		</div>
	</div>
</template>

<script>
import zego from '@/common/zego.js'
var interval = null
export default {
	name: 'Sim',
	data () {
		return {
			zg: null,
			isLogin: false,
			isPlay: false,
			isMute: false,
			token: '',
			time: 0,
			mineInfo: {},
			custInfo: {},
			info: {},
			streamList: [],
			userList: [],
			rowData: {
				userName: 'User Name',
				userID: 'User ID',
				start: 'Start Time',
				end: 'End Time',
				stay: 'Duration',
			},
		}
	},
	created () {
		var { token, roomID } = this.$route.query
		this.token = token
		this.verify(roomID)
	},
	watch: {
		isPlay (n) {
			this.setInterval(n)
		}
	},
	methods: {
		setData (flag) {
			if (flag) {
				this.custInfo.start = new Date().getTime()
				return
			}
			this.custInfo.end = new Date().getTime()
			var { custInfo } = this
			this.userList.push({
				...custInfo,
				start: this.$filter.formatDate(custInfo.start),
				end: this.$filter.formatDate(custInfo.end),
				stay: this.$filter.formatTime((custInfo.end - custInfo.start) / 1000),
			})
			console.log(this.userList)
		},
		setInterval (flag) {
			if (flag) {
				this.setData(true)
				interval = setInterval(() => {
					this.time += 1
				}, 1000)
				return
			}
			clearInterval(interval)
			this.setData()
			this.time = 0
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
		onLogin (flag) {
			if (flag) {
				zego.loginRoom()
				this.updateRoom({
					count: 'add',
					publish: 'true',
				})
				.then(() => this.isLogin = flag)
			} else {
				if (this.isPlay) this.onPlay()
				zego.logoutRoom()
				this.updateRoom({
					count: 'reduce',
					publish: 'false',
				})
				.then(() => this.isLogin = flag)
			}
		},
		onPlay (flag) {
			if (flag) {
				this.pushVideoStream(true)
				this.pushAudioStream(true)
				this.pullAudioStream(true)
			} else {
				this.pushVideoStream()
				this.pushAudioStream()
				this.pullAudioStream()
				this.streamList = []
			}
		},
		onMute (flag) {
			var { zg } = this
			this.isMute = flag
			flag
				? zg.muteMicrophone(true)
				: zg.muteMicrophone(false)
		},
		pushVideoStream (flag) {
			var { info } = this
			flag
			 ? zego.startPublishingStream(info.streamID)
			 : zego.stopPublishingStream(info.streamID)
		},
		pushAudioStream (flag) {
			var { info } = this
			flag
			 ? zego.startPublishingStream(`${info.streamID}audio`, true)
			 : zego.stopPublishingStream(`${info.streamID}audio`)
		},
		pullAudioStream (flag) {
			var { streamList } = this
			streamList.forEach(item => {
				var { streamID } = item
				if (streamID.indexOf('audio') > -1) {
					if (flag) {
						zego.startPlayingStream(streamID)
						.then(stream => {
							this.$refs.audio.srcObject = stream
							this.isPlay = true
						})
					} else {
						zego.stopPlayingStream(streamID)
						this.$refs.audio.srcObject = null
						this.isPlay = false
					}
				}
			})
		},
		initEvent () {
			var { zg } = this
			zg.on('roomStateUpdate', (roomID, state, errorCode) => {
				console.warn('房间状态更新：', state)
				if (!this.isLogin && state === 'CONNECTED') {
					// 与房间连接成功
					zego.createVideoStream()
					.then(() => {
						zego.createAudioStream()
					})
					.catch(() => {
						this.onLogin(false)
					})
				}
			})
			zg.on('roomUserUpdate', (roomID, updateType, userList) => {
				console.warn('用户状态更新：', updateType)
				console.log(userList)
				var userInfo = userList[0]
				if (updateType === 'ADD') {
					// 用户新增
					this.custInfo = userInfo
					this.updateRoom({
						count: 'add',
						user_id: userInfo.userID,
						user_name: userInfo.userName,
					})
				} else if (updateType === 'DELETE') {
					// 用户减少
					this.updateRoom({
						count: 'reduce',
						user_id: userInfo.userID,
						user_name: userInfo.userName,
					})
				}
			})
			zg.on('roomStreamUpdate', async (roomID, updateType, streamList) => {
				console.warn('流状态更新：', updateType)
				console.log(streamList)
				if (updateType === 'ADD') {
					// 流新增
					this.streamList = streamList
				} else if (updateType === 'DELETE') {
					// 流减少
					this.onPlay()
				}
			})
		},
		updateRoom (data) {
			console.log('开始更新房间')
			var { roomID, userID, userName } = this.info
			return this.$http.updateRoom({
				room_id: roomID,
				user_id: userID,
				user_name: userName,
				...data,
			})
		},
		verify (roomID) {
			console.log('开始获取用户信息')
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
				& > div:last-child {
					font-family: PingFangSC, PingFangSC-Regular;
					font-size: 12px;
					color: #757575;
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
