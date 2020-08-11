/**
 * 
 * 给定一个可能含有重复元素的整数数组，要求随机输出给定的数字的索引。 您可以假设给定的数字一定存在于数组中。

注意：
数组大小可能非常大。 使用太多额外空间的解决方案将不会通过测试。

示例:

int[] nums = new int[] {1,2,3,3,3};
Solution solution = new Solution(nums);

// pick(3) 应该返回索引 2,3 或者 4。每个索引的返回概率应该相等。
solution.pick(3);

// pick(1) 应该返回 0。因为只有nums[0]等于1。
solution.pick(1);

来源：力扣（LeetCode）
链接：https://leetcode-cn.com/problems/random-pick-index
著作权归领扣网络所有。商业转载请联系官方授权，非商业转载请注明出处。
 * @param {number[]} nums
 */
var Solution = function(nums) {
  this.nums = []
  if(Array.isArray){
    this.nums = nums
  }
};

/** 
 * @param {number} target
 * @return {number}
 */
Solution.prototype.pick = function(target) {
  let findTarget = []
  /** 遍历查找target */
  for(let i = 0; i < this.nums.length ; i ++){
    if(this.nums[i] === target){
      findTarget.push(i)
    }
  }
  // let res = null
  // let randomValue = Number.parseInt(Math.random(10) * 10)
  // console.log('findTarget',findTarget)
  // while(!findTarget[randomValue]){
  //   randomValue = Number.parseInt(Math.random(10) * 10)
  // }
  const res = Number.parseInt(Math.random(10) * findTarget.length)
  console.log('res',res)
  return findTarget[res] 
};

/**
 * Your Solution object will be instantiated and called as such:
 * var obj = new Solution(nums)
 * var param_1 = obj.pick(target)
 */

var obj = new Solution([1,2,2,2,3,4,5,6,6,6,6])
var param_1 = obj.pick(6)
console.log(param_1)