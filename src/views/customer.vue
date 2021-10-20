<template>
  <div>
		<div>
			<zego
				ref="zego" client
				:streamID="userID" :roomID="roomID" :userID="userID" :userName="userName"
				@video="getVideo" @audio="getAudio" @stop="stop"
			/>
			<video ref="video" autoplay playsinline></video>
			<audio ref="audio" loop preload autoplay playsinline controls hidden/>
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
			roomID: '5',
			userID: '453',
			userName: '1',
		}
	},
	methods: {
		getVideo (e) {
			this.$refs.video.srcObject = e
		},
		getAudio (e) {
			this.$refs.audio.srcObject = e
		},
		stop () {
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

</style>
