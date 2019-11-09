// 图类
class Graph {
    constructor(){
        this.vertices = []; // 图的所有定点
        this.adjList = {} //图的定点与 该顶点临边
    }
    // 给图添加定点
    addVertex(v){
        this.vertices.push(v)
        this.adjList[v] = []
    }
    // 给定点添加边 如v,w是一条边 则 v定点边 添加w，w定点添加v
    addEdge(v,w){
        this.adjList[v].push(w)
        this.adjList[w].push(v)
    }
    // 打印图的方法
    toString(){
        let string = ''
        this.vertices.forEach(d=>{
            string += `${d} ->`
            let neighbors = this.adjList[d]
            string += neighbors.map(e=>e).join(' ')
            string += '\n'
        })
        return string
    }
    /**
     * 给一个图的所有定点初始化为状态 并返回初始状态映射
     * 白色 未被访问
     * 灰色 访问过，但未被探索
     * 黑色 被完全探索过
     * @return {Object} color  初始状态映射
     */
    initializaColor(){
        const color = {}
        this.vertices.forEach(d=>{
            color[d] = 'white'
        })
        return color
    }
    /**
     * 广度优先算法遍历图
     * @param {*} v  定点
     * @param {Function} cb  访问完一个定点执行的回调函数
     */
    bfs(v,cb){
        let color = this.initializaColor()
        let queue = [] //
        queue.push(v) // 将定点 加入队列
        console.log(12121)
        while(queue.length !== 0){
            const shift = queue.shift()
            let neighbors = this.adjList[shift]
            color[shift] = 'grey' // 将当前取出临边的顶点标记为 灰色 ， 表示已经访问 但是还未探索该顶点的临边

            // 访问当前取出定点 shift  的临边
            neighbors.forEach(d=>{
                // 如果当前临边未被访问 则访问（将其加入 queue 访问队列）
                if(color[d] === 'white'){
                    color[d] = 'grey'
                    queue.push(d)
                }
            })

            // 已经访问 及 探索完 shift  定点, 将其标记为 黑色  , 执行回调
            color[shift] = 'black'
            cb(shift)
        }
    }
    // BFS 算法寻找最短路径
    bfsMinDistances(v,cb){
        let color = this.initializaColor()
        let queue = [] //
        let distances = {} // v定点 对应图上每个点的距离
        let predecessors = {} // 前溯点数组
        queue.push(v) // 将定点 加入队列

        this.vertices.forEach(d=>{
            distances[d] = 0
            predecessors[d] = null
        })
        
        while(queue.length !== 0){
            const shift = queue.shift()
            let neighbors = this.adjList[shift]
            color[shift] = 'grey' // 将当前取出临边的顶点标记为 灰色 ， 表示已经访问 但是还未探索该顶点的临边

            // 访问当前取出定点 shift  的临边
            neighbors.forEach(d=>{
                // 如果当前临边未被访问 则访问（将其加入 queue 访问队列）
                if(color[d] === 'white'){
                    distances[d] = distances[shift] + 1
                    predecessors[d] = shift 
                    color[d] = 'grey'
                    queue.push(d)
                }
            })

            // 已经访问 及 探索完 shift  定点, 将其标记为 黑色  , 执行回调
            color[shift] = 'black'
            cb(shift)
        }

        return {
            distances,
            predecessors
        }
    }
    /**
     * 深度优先算法遍历图
     */
    dfs(v,cb){
        console.log(v)

    }
   
}

module.exports = Graph






