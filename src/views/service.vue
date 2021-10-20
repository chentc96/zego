<template>
  <div>
		<div>
			<zego
				ref="zego"
				:streamID="userID" :roomID="roomID" :userID="userID" :userName="userName"
				@audio="getAudio" @stop="stop"
			/>
			<audio ref="audio" loop preload autoplay playsinline controls/>
			<button @click="hangUp">退出房间</button>
		</div>
	</div>
</template>

<script>
import zego from '@/components/zego.vue'
export default {
	name: 'Service',
	components: {
		zego,
	},
	data () {
		return {
			roomID: '5',
			userID: '1',
			userName: '1',
		}
	},
	methods: {
		getAudio (e) {
			this.$refs.audio.srcObject = e
		},
		stop () {
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
