<template>
	<div class="tc-popup" :class="mode" v-if="value">
		<!-- <transition class="tc-popup-main" :show="value" :mode-class="modeClass"> -->
		<div class="tc-popup-main">
			<tc-icons class="tc-popup-close" v-if="close" :image="require('@/assets/img/close.png')" size="16" @click="onClose(false)"/>
			<div class="tc-popup-ctn">
				<slot>
					<div class="tc-popup_tit" v-if="mode !== 'sticky' && title">{{title}}</div>
				</slot>
				<slot>
					<div class="tc-popup_msg">{{msg}}</div>
				</slot>
			</div>
			<div class="tc-popup-btn" v-if="mode === 'center'">
				<div class="tc-popup_cancel" v-if="cancel" @click="onClose(false)">{{cancel}}</div>
				<div class="tc-popup_confirm" v-if="confirm" @click="onClose(true)">{{confirm}}</div>
			</div>
			</div>
		<!-- </transition> -->
		<div class="tc-popup-mask" @click="mask && onClose(false)"></div>
	</div>
</template>

<script>
	export default {
		name: 'tc-popup',
		props: {
			value: Boolean,
			mask: Boolean,
			close: Boolean,
			msg: String,
			mode: {
				type: String,
				default: 'center' // sticky bottom center
			},
			title: {
				type: String / Boolean,
				default: '提示'
			},
			cancel: {
				type: String / Boolean,
				default: '取消'
			},
			confirm: {
				type: String / Boolean,
				default: '确定'
			},
		},
		data () {
			return {
				modeClass: 'fade'
			}
		},
		created () {
			let { mode } = this
			if (mode === 'bottom') {
				this.modeClass = 'slide-bottom'
			} else if (mode === 'sticky') {
				this.modeClass = 'slide-top'
			}
		},
		methods: {
			onClose (flag) {
				this.$emit('input', false)
				this.$emit('click', flag)
			}
		}
	}
</script>

<style lang="scss" scoped>
.tc-popup {
	position: fixed;
	top: 0;
	left: 0;
	bottom: 0;
	right: 0;
	.tc-popup-mask {
		height: 100%;
	}
	.tc-popup-main {
		color: #FFF;
		position: absolute;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		background-color: rgba(0, 0, 0, 0.8);
		max-width: 500px;
		.tc-popup-close {
			position: absolute;
			top: 10px;
			right: 10px;
		}
		.tc-popup-ctn {
			.tc-popup_tit {
				font-family: SFUIDisplay, SFUIDisplay-Bold;
				font-size: 18px;
				font-weight: 700;
				padding: 10px 0 10px 4px;
				width: 94%;
				margin: 0 auto;
				border-bottom: 1px solid #979797;
			}
			.tc-popup_msg {
				font-family: PingFangSC, PingFangSC-Semibold;
				font-size: 14px;
				font-weight: 600;
				text-align: center;
				padding: 25px 0;
			}
		}
		.tc-popup-btn {
			display: flex;
			justify-content: center;
			font-family: PingFangSC, PingFangSC-Semibold;
			font-size: 14px;
			font-weight: 600;
			text-align: center;
			margin-bottom: 38px;
			& > div {
				cursor: pointer;
				box-sizing: border-box;
				margin: 0 6px;
				padding: 10px 0;
				min-width: 120px;
				border-radius: 4px;
			}
			.tc-popup_cancel {
				background-image: linear-gradient(90deg,#e2c88d, #ad874e);
			}
			.tc-popup_confirm {
				border: 2px solid #979797;
			}
		}
	}
}
.center {
	z-index: 100;
	.tc-popup-main {
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		width: 80%;
		border-radius: 4px;
	}
}
.bottom {
	z-index: 90;
	.tc-popup-main {
		bottom: 0;
		width: 100%;
		border-radius: 30px 30px 0 0;
	}
}
.sticky {
	position: absolute;
	top: unset;
	bottom: unset;
	width: 100%;
	height: 100%;
	z-index: 80;
	.tc-popup-main {
		width: 100%;
	}
}
</style>
