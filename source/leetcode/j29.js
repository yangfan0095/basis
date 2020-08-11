/**
 * 
输入一个矩阵，按照从外向里以顺时针的顺序依次打印出每一个数字。 

示例 1：

输入：matrix = [[1,2,3],
              [4,5,6],
              [7,8,9]]
输出：[1,2,3,6,9,8,7,4,5]
示例 2：

输入：matrix = [[1,2,3,4],
               [5,6,7,8],
               [9,10,11,12]]
输出：[1,2,3,4,8,12,11,10,9,5,6,7]
 

限制：

0 <= matrix.length <= 100
0 <= matrix[i].length <= 100

来源：力扣（LeetCode）
链接：https://leetcode-cn.com/problems/shun-shi-zhen-da-yin-ju-zhen-lcof
著作权归领扣网络所有。商业转载请联系官方授权，非商业转载请注明出处。
 */

 /**
  * 
    解法思路
    一圈一圈的遍历 每一圈确定四个顶点 
    遍历完更新四个顶点
    当四个顶点中 top  === bottom 则表示遍历完成
  */
 /**
 * @param {number[][]} matrix
 * @return {number[]}
 */
var spiralOrder = function(matrix) {
  // 初始化四个坐标位置
  let t = 0;
  let r = matrix[0].length -1;
  let b = matrix.length -1;
  let l = 0;
  console.log('t:',t,'r:',r,'b:',b,'l:',l)
  let res = []
  // 底部大于顶部
  while(b > t && l < r){
    // top 遍历
    for(let i = l; i < r; i++){
      res.push(matrix[t][i])
    }
    // right 遍历 xz
    for(let i = t ; i < b; i++){
      res.push(matrix[i][r])
    }
    // bottom 遍历
    for(let i = r; i > l; i--){
      res.push(matrix[b][i])
    }
    // left 遍历
    for(let i = b; i > t; i--){
      res.push(matrix[i][l])
    }
    t++;
    r--;
    b--;
    l++;
  }
  // 上下相等  从左到右遍历
  if(b === t){
    for(let i=l;i <= r; i++){
      res.push(matrix[t][i])
    }
  }
  // 左右相等 从上到下遍历
  else if(l === r){
    for(let i = t; i <= b;i++){
      res.push(matrix[i][l])
    }
  }
  return res
};

var matrix = [[1,2,3,4],
              [5,6,7,8],
              [9,10,11,12]]
spiralOrder(matrix)

// [1,2,3,4,8,12,11,10,9,5,6,7]


