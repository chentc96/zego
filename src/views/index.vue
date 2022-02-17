<template>
  <div>
		<iframe ref="iframe" :src="`${url}${mineId}/index.html`"/>
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
	mounted () {
		let loading = this.$loading()
		this.$refs.iframe.onload = () => {
		  loading.close()
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
