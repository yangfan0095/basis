const request = require('request')

setTimeout(() => {
	console.log('123')
}, 0)

let promise1 = function() {
	return new Promise((resolve, reject) => {
		console.log('promise1')
		resolve(true)
	})
}
let promise2 = function() {
	return new Promise((resolve, reject) => {
		resolve(true)
	})
}
let promise3 = function() {
	return new Promise((resolve, reject) => {
		resolve(true)
	})
}
let promise4 = function() {
	return new Promise((resolve, reject) => {
		resolve(true)
	})
}
let promise5 = function() {
	return new Promise((resolve, reject) => {
		request('http://www.baidu.com', () => {
			resolve(true)
			console.log('http://www.baidu2.com')
		})
	})
}

promise1().then(() => {
	console.log('promise1')
})
promise2().then(() => {
	console.log('promise2')
})
promise3().then(() => {
	console.log('promise3')
})
promise4().then(() => {
	console.log('promise4')
})
promise5().then(() => {
	console.log('promise5')
})

request('http://www.baidu.com', () => {
	console.log('http://www.baidu.com')
})
