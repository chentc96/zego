<template>
  <div>
		<div>
			<zego
				ref="zego" client
				:streamID="userID" :roomID="roomID" :userID="userID" :userName="userName"
				@start="start" @stop="stop"
			/>
			<video ref="video" autoplay playsinline></video>
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
		start (e) {
			this.$refs.video.srcObject = e
		},
		stop () {
			this.$refs.video.srcObject = null
		},
		hangUp () {
			this.$refs.zego.hangUp()
		},
	}
}
</script>

<style>

</style>
