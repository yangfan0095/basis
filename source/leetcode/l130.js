/**
 * 
给定一个二维的矩阵，包含 'X' 和 'O'（字母 O）。

找到所有被 'X' 围绕的区域，并将这些区域里所有的 'O' 用 'X' 填充。

示例:

X X X X
X O O X
X X O X
X O X X
运行你的函数后，矩阵变为：

X X X X
X X X X
X X X X
X O X X
解释:

被围绕的区间不会存在于边界上，换句话说，任何边界上的 'O' 都不会被填充为 'X'。 任何不在边界上，或不与边界上的 'O' 相连的 'O' 最终都会被填充为 'X'。如果两个元素在水平或垂直方向相邻，则称它们是“相连”的。

来源：力扣（LeetCode）
链接：https://leetcode-cn.com/problems/surrounded-regions
著作权归领扣网络所有。商业转载请联系官方授权，非商业转载请注明出处。

 */

/**
 *
 * @param board
 */
const dfs = (board, x, y) => {
  const width = board[0].length
  const height = board.length
  if (x < 0 || x > height - 1 || y < 0 || y > width - 1 || board[x][y] !== 'O') {
    return
  }
  board[x][y] = 'M'
  dfs(board, x - 1, y)
  dfs(board, x + 1, y)
  dfs(board, x, y - 1)
  dfs(board, x, y + 1)
}

const solve = (board) => {
  if (!Array.isArray(board) || board.length === 0) {
    return
  }
  const width = board[0].length
  const height = board.length
  // 上下边界
  for (let i = 0; i < width; i++) {
    if (board[0][i] === 'O') {
      dfs(board, 0, i)
    }
    if (board[height - 1][i] === 'O') {
      dfs(board, height - 1, i)
    }
  }
  // 左右边界
  for (let j = 0; j < height; j++) {
    if (board[j][0] === 'O') {
      dfs(board, j, 0)
    }
    if (board[j][width - 1] === 'O') {
      dfs(board, j, width - 1)
    }
  }

  // 查找替换点&处理
  for (let i = 0; i < height; i++) {
    for (let j = 0; j < width; j++) {
      try{
      if (board[i][j] === 'M') {
        board[i][j] = 'O'
      } else if (board[i][j] === 'O') {
        board[i][j] = 'X'
      }
    }catch(err){
      console.log(err,i,j,board)
    }
    }
  }
  return board
}

let a = [
  ["X","O","X","O","X","O"],
  ["O","X","O","X","O","X"],
  ["X","O","X","O","X","O"],
  ["O","X","O","X","O","X"]
]

const res = solve(a)
// [["X","O","X"],["O","X","O"],["X","O","X"]]
console.log('res', JSON.stringify({ a: res }))
