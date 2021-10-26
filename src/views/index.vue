<template>
  <div>
		<iframe :src="`${url}${mineId}/`"/>
	</div>
</template>

<script>
import $api from '@/common/api.js'
export default {
	name: 'Vr',
	props: {
		mineId: {
			type: String / Number,
			default () {
				return this.$route.params.mineId
			}
		},
	},
	data () {
		return {
			url: $api.vr,
		}
	},
}
</script>

<style>
iframe {
	position: fixed;
	width: 100%;
	height: 100%;
}
</style>
