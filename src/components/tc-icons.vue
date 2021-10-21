<template>
	<div
		class="tc-icons"
		:style="{
			'color': value ? colorOn : color,
		}"
		@click="onClick"
	>
		<img
			:style="{
				[`margin-${align}`]: `${space}px`,
				width: `${size}px`,
				height: `${size}px`,
				...imageClass,
			}"
			:src="src"
			alt="icons"
			@error="onErr"
		/>
		<div><slot/></div>
	</div>
</template>

<script>
	export default {
		name: 'tc-icons',
		props: {
			value: Boolean, // 点击切换状态
			imageClass: Object,
			image: String,
			imageOn: String,
			color: String,
			colorOn: String,
			longpress: Boolean, // 是否长按识别二维码
			space: String / Number, // 文字与图片的间距
			error: {
				type: String / Boolean,
				default: require('@/assets/img/not_image.png')
			}, // src加载错误时的替换图片地址
			size: {
				type: String / Number,
				default: 16
			},
			align: {
				type: String,
				default: 'right'
			}, // 文字相对于图片的方向
		},
		data () {
			return {
				src: '',
			}
		},
		watch: {
			value: {
				handler () {
					this.getSrc()
				},
				immediate: true,
			},
			image () {
				this.getSrc()
			}
		},
		methods: {
			getSrc () {
				let { image, imageOn, value } = this
				this.src = value ? imageOn : image
			},
			onErr () {
				let { error } = this
				this.src = error
			},
			onClick () {
				let { value } = this
				this.$emit('input', !value)
				this.$emit('click', !value)
			},
		}
	}
</script>

<style lang="scss" scoped>
.tc-icons {
	display: inline-flex;
	align-items: center;
	justify-content: center;
}
.left {
	flex-direction: row-reverse;
}
.top {
	flex-direction: column-reverse;
}
.bottom {
	flex-direction: column;
}
</style>
