// 实现一个基本的有限的并发函数
function parallel() {
	let tasks = []
	let concurrency = 2,
		running = 0,
		completed = 0,
		index = 0
	let next = () => {
		while (running < concurrency && index < tasks.length) {
			let task = tasks[index++]
			task(() => {
				if (completed === tasks.length) {
					return finish()
				}
				completed++, running--
				next()
			})
			running++
		}
	}
	let finish = cb => {
		if (typeof cb === 'function') {
			cb()
		}
		console.log('finish')
	}

	return {
		// 设置并发量
		setCount: num => {
			if (typeof num === 'number') {
				concurrency = num
			}
		},
		// 设置任务队列
		setTask: arrFn => {
			// 判断传入的是函数
			if (typeof arrFn === 'function') {
				tasks.push(fn)
				return
			}
			// 传入的是数组
			if (Array.isArray(arrFn)) {
				arrFn.map(fn => {
					if (typeof fn === 'function') {
						tasks.push(fn)
					}
				})
			}
		},
		// 执行函数
		execte: () => {
			next()
		}
	}
}

/**
 * 测试代码
 */

let task1 = next => {
	setTimeout(() => {
		console.log('task 1')
		next()
	}, 0)
}
let task2 = next => {
	setTimeout(() => {
		console.log('task 2,1000ms')
		next()
	}, 3000)
}
let task3 = next => {
	setTimeout(() => {
		console.log('task 3,200ms')
		next()
	}, 200)
}

let taskArr = [task1, task2, task3]
let parallelInstance = new parallel()
parallelInstance.setTask(taskArr)
parallelInstance.execte()

/***
 * 
 * 代码运行结果
        task 1
        task 3,200ms
        task 2,1000ms

    之所以 200ms 的 task3在task2 前打出日志 是因为，我们设置并发总数为2. 当task1 执行完时,正在执行的任务 running小于2 。
    所以task3会进入调用栈，task3的最小延迟时间小与 task2 所以 task3的 cb 先进入执行（宏）队列  所以先打印日志
 * 
 * 
 */
