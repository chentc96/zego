export default {
	formatTime (time) {
	    let m = Math.floor(time % 3600 / 60)
	    let s = Math.floor(time % 3600 % 60)
	    return `${`0${m}`.slice(-2)}:${`0${s}`.slice(-2)}`
	}, // 格式化时间
	formatDate (time, format = 'YYYY-MM-DD hh:mm:ss') {
		let date = new Date(time),
			year = date.getFullYear(),
			month = date.getMonth() + 1,
			day = date.getDate(),
			hour = date.getHours(),
			minute = date.getMinutes(),
			second = date.getSeconds()
		return format
		.replace('YYYY', year)
		.replace('MM', `0${month}`.slice(-2))
		.replace('DD', `0${day}`.slice(-2))
		.replace('hh', `0${hour}`.slice(-2))
		.replace('mm', `0${minute}`.slice(-2))
		.replace('ss', `0${second}`.slice(-2))
	}, // 格式化日期
}