

let nums = [-2, 1, -3, 4, -1, 2, 1, -5, 4]

/**
 *  冒泡排序
 * @param {*} arr
 */
let bubbleSort = arr => {
	if (!Array.isArray(arr)) return
	let len = arr.length
	for (let i = 0; i < len - 1; i++) {
		for (let j = 0; j < len - 1; j++) {
			// 比较相邻元素大小
			if (arr[j] < arr[j + 1]) {
				let tmp = arr[j]
				arr[j + 1] = arr[j]
				arr[j] = tmp
			}
		}
	}
	return arr
}
let a = bubbleSort(nums)
console.log(a)

/**
 * 最大子序求和
 * 给定一个整数数组 nums ，找到一个具有最大和的连续子数组（子数组最少包含一个元素），返回其最大和。
 * 
 * 参考冒泡排序 解此题
 * @param {*} nums 
 */
let maxSubArray = (nums) => {
    
}