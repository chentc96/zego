<template>
  <div class="customer-page">
		<zego
			ref="zego" client
			:streamID="userID" :roomID="roomID" :userID="userID" :userName="userName"
			@video="getVideo" @audio="getAudio" @stop="stop"
		/>
		<iframe v-show="!playing" :src="`/pano2vr/${mineID}/`"/>
		<video v-show="playing" ref="video" autoplay playsinline/>
		<audio ref="audio" loop preload autoplay playsinline controls hidden/>
		<div class="">
			
		</div>
	</div>
</template>

<script>
import zego from '@/components/zego.vue'
export default {
	name: 'Customer',
	components: {
		zego,
	},
	data () {
		return {
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

<style>
iframe,
video {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
}
video {
	background-color: #000;
}
</style>
