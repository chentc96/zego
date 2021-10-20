<template>
  <div>
		<div>
			<zego
				ref="zego" client
				:streamID="userID" :roomID="roomID" :userID="userID" :userName="userName"
				@start="start" @stop="stop"
			/>
			<audio ref="audio" loop preload autoplay playsinline controls/>
			<button @click="hangUp">退出房间</button>
		</div>
	</div>
</template>

<script>
import zego from '@/components/zego.vue'
export default {
	name: 'Home',
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
		start (e) {
			console.warn(e)
		},
		stop () {
			
		},
		hangUp () {
			this.$refs.zego.hangUp()
		},
	}
}
</script>

<style>

</style>
