/**
 * 
 * 
 * 
 * 
给定一个包括 n 个整数的数组 nums 和 一个目标值 target。找出 nums 中的三个整数，使得它们的和与 target 最接近。返回这三个数的和。假定每组输入只存在唯一答案。

示例：

输入：nums = [-1,2,1,-4], target = 1
输出：2
解释：与 target 最接近的和是 2 (-1 + 2 + 1 = 2) 。
 

提示：

3 <= nums.length <= 10^3
-10^3 <= nums[i] <= 10^3
-10^4 <= target <= 10^4

来源：力扣（LeetCode）
链接：https://leetcode-cn.com/problems/3sum-closest
著作权归领扣网络所有。商业转载请联系官方授权，非商业转载请注明出处。

 */

/**
  * 
    解题分析
    step1 首先将数组升序 降低复杂度
    step2 下标遍历确定起始计算点 双指针确定范围
    如果起始点 + 双指针 > 目标   ---> 缩小构造值  即 右指针左移 （判断是否新值是否和 老移前值相等 相等 则 再移动一步）
    如果起始点 + 双指针 < 目标   ---> 增大构造值  即 左指针右移   ...
    返回 答案
  */

function sortNum01(x, y) {
  if (x < y) {
    return -1
  }
  if (x > y) {
    return 1
  }
  return 0
}
/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number}
 */
var threeSumClosest = function (nums, target) {
  const sortArray = nums.sort(sortNum01)
  let res = sortArray[0] + sortArray[1] + sortArray[2]
  for (let i = 0; i < sortArray.length; i++) {
    let j = i + 1,
      k = sortArray.length - 1
    while (j < k) {
      const sum = sortArray[i] + sortArray[j] + sortArray[k]
      // update res
      if (Math.abs(sum - target) < Math.abs(res - target)) {
        res = sum
      }
      if (sum > target) {
        k -= 1
      } else if (sum < target) {
        j += 1
      } else {
        console.log('sum', sum)
        return sum
      }
    }
  }
  console.log(res)
  return res
}

threeSumClosest([-1, 2, 1, -4], 1)
