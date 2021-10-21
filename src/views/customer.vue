<template>
  <div class="customer-page">
		<!-- <zego
			ref="zego" client
			:streamID="userID" :roomID="roomID" :userID="userID" :userName="userName"
			@video="getVideo" @audio="getAudio" @stop="stop"
		/> -->
		<tc-popup
			title="Leaving VR to watch Mine"
			msg="You will leave VR to watch Mine. Do you want to continue?"
			cancel="Hold On"
			confirm="Leave"
			v-model="show"
		></tc-popup>
		<iframe v-show="!playing" :src="`/pano2vr/${mineID}/`"/>
		<video v-show="playing" ref="video" autoplay playsinline/>
		<audio ref="audio" loop preload autoplay playsinline controls hidden/>
		<div class="customer-main">
			<div>
				<tc-icons :image="require('@/assets/img/out.png')" size="38" space="8" :imageClass="{
					'border-radius': '50%',
				}">
					<div class="customer-main_info">
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
// import zego from '@/components/zego.vue'
export default {
	name: 'Customer',
	// components: {
	// 	zego,
	// },
	data () {
		return {
			show: true,
			mineID: '1',
			roomID: '5',
			userID: '453',
			userName: '1',
			playing: false,
		}
	},
	methods: {
		getVideo (e) {
			this.playing = true
			this.$refs.video.srcObject = e
		},
		getAudio (e) {
			this.$refs.audio.srcObject = e
		},
		stop () {
			this.playing = false
			this.$refs.video.srcObject = null
			this.$refs.audio.srcObject = null
		},
		hangUp () {
			this.$refs.zego.hangUp()
		},
	}
}
</script>

<style lang="scss" scoped>
.customer-page {
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
	.customer-main {
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
		.customer-main_info {
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
