<template>
  <div class="sim-page">
		<!-- <audio ref="audio" loop preload autoplay playsinline controls/>
		<button @click="logoutRoom">退出房间</button> -->
		<div class="sim-header">
			<div class="sim-header_pic">
				<img src="@/assets/img/view.png" alt="pic">
			</div>
			<div class="sim-header_info">
				<div class="header-info_name">bitmine Mine 01</div>
				<div>
					<tc-icons :image="require('@/assets/img/pic.png')" size="36" space="10" :imageClass="{
						'border-radius': '50%',
					}">
						<div class="header-info_serve">
							<div>Jarry <span class="status">离线</span></div>
							<div>customer service</div>
						</div>
					</tc-icons>
				</div>
				<div class="header-info_time">2021-10-12 12:15:00 至 2021-10-12 13:30:30</div>
			</div>
		</div>
		<div class="sim-centre">
			<div class="sim-centre_state">正在通话</div>
			<div class="sim-centre_time">00:12:49</div>
			<div class="sim-centre_audio">
				
			</div>
			<div class="sim-centre_active">
				<tc-icons
					:image="require('@/assets/img/pause.png')"
					:imageOn="require('@/assets/img/play.png')"
					size="62" space="12" align="bottom"
					colorOn="#1E9FFF"
					v-model="playing"
					@click="onPlay"
				>{{playing ? '暂停' :'开始'}}</tc-icons>
				<!-- <tc-icons
					:image="require('@/assets/img/save.png')"
					size="62" space="12" align="bottom"
				>保存</tc-icons> -->
			</div>
		</div>
		<div class="sim-footer">
			<!-- <div class="sim-footer_time">常看次数：<span>120</span> 平均时长：<span>30分钟</span></div> -->
			<div class="sim-footer_list">
				<el-table :data="tableData" height="280" border :header-cell-style="{ backgroundColor: '#EEE' }">
					<el-table-column label="序号" type="index" width="80" align="center"/>
					<el-table-column v-for="(v, k, i) in rowData" :key="i" :prop="k" :label="v" align="center"/>
				</el-table>
			</div>
			<!-- <div class="sim-footer_tips">备注：若用户自己退出VR带看，则系统自动保存语音（格式为：客户ID+进入房间时间）到客服的统计数据列表中</div> -->
		</div>
	</div>
</template>

<script>
import zego from '@/common/zego.js'
import filter from '@/common/filter.js'
export default {
	name: 'Sim',
	data () {
		return {
			token: '',
			playing: false,
			zg: null,
			info: {
				roomID: '5',
				streamID: '1',
				userID: '1',
				userName: '1',
			},
			rowData: {
				userName: '用户名',
				userId: '用户ID',
				on: '进入房间时间',
				out: '离开房间时间',
				stay: '停留时长',
			},
			tableData: [
				// {
    //       userName: '111',
    //       userId: '111',
    //       on: 1634897009036,
    //       out: 1634897039036,
    //     },
			]
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
		// this.setData()
	},
	methods: {
		setData () {
			this.tableData = this.tableData.map(item => {
				return {
					...item,
					on: filter.formatDate(item.on),
					out: filter.formatDate(item.out),
					stay: filter.formatTime(item.out - item.on),
				}
			})
		},
		onPlay () {
			var { playing } = this
			this.playing = playing
		},
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
					zego.createVideoStream()
					.then(() => {
						zego.createAudioStream()
						.then(() => {
							this.startPushStream()
							this.updateRoom({
								count: 'add',
							})
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

<style lang="scss" scoped>
.sim-page {
	img {
		width: 100%;
		height: 100%;
	}
	.sim-header {
		padding: 14px 24px 20px;
		background-color: #FFF;
		border: 1px solid #EEE;
		box-shadow: 0 12px 12px 0px rgba(0, 0, 0, 0.05);
		display: flex;
		.sim-header_pic {
			width: 160px;
			height: 98px;
			border-radius: 4px;
			overflow: hidden;
			margin-right: 12px;
		}
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
			height: 142px;
			background-color: #F7F7F7;
			border: 1px solid #EEE;
			border-radius: 4px;
		}
		.sim-centre_active {
			font-family: PingFangSC, PingFangSC-Regular;
			font-size: 14px;
			color: #757575;
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
