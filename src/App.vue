<template>
  <div>
		<router-view/>
	</div>
</template>

<style lang="scss">
* {
	margin: 0;
	padding: 0;
}
[class*='status'] {
	font-family: PingFangSC, PingFangSC-Regular;
	font-size: 12px;
	position: relative;
	padding-left: 10px;
	&:before {
		content: '';
		position: absolute;
		top: 50%;
		left: 0;
		transform: translateY(-50%);
		width: 8px;
		height: 8px;
		border-radius: 50%;
	}
	&[class*='0'] {
		color: red;
		&:before {
			background-color: red;
		}
	}
	&[class*='1'] {
		color: green;
		&:before {
			background-color: green;
		}
	}
	&[class*='2'] {
		color: orange;
		&:before {
			background-color: orange;
		}
	}
}
</style>
