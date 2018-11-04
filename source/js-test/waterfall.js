// js 顺序迭代
const waterfall = () => {
	let tasks = []
	// 顺序遍历执行队列
	let iterate = index => {
		if (index === tasks.length) {
			return finish()
		}
		const task = tasks[index]
		task(() => {
			iterate(index + 1)
		})
	}
	let finish = () => {
		console.log('finished')
	}

	return {
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
			iterate(0)
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
		console.log('task 2')
		next()
	}, 0)
}
let task3 = next => {
	setTimeout(() => {
		console.log('task 3')
		next()
	}, 0)
}

let taskArr = [task1, task2, task3]
let waterfallInstance = new waterfall()
waterfallInstance.setTask(taskArr)
waterfallInstance.execte()
