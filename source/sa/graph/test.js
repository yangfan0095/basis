// 测试用例
const Graph = require('./Graph') 


/*--------------------------------------------------------------------testGraph----------------------------------------------------*/

const createGraph = ()=>{
    const graph = new Graph()
    const myVertices = ['A','B','C','D','E','F','G','H','I','J','K']
    // 给图添加定点
    myVertices.forEach(d=>{
        graph.addVertex(d)
    })
    graph.addEdge('A','B')
    graph.addEdge('A','C')
    graph.addEdge('A','D')
    graph.addEdge('A','E')
    graph.addEdge('A','F')
    graph.addEdge('B','C')
    graph.addEdge('C','D')
    graph.addEdge('D','G')
    graph.addEdge('G','H')
    graph.addEdge('H','I')
    graph.addEdge('I','J')
    graph.addEdge('G','K')
    graph.addEdge('J','K')

    return graph
}
// 测试图的构造
const testGraph  = () =>{
    const graph = createGraph()
    const string = graph.toString()
    console.log(string)
    return graph



    /**
     * 
     * 预期输出:
     *  A ->B C D E F
        B ->A C
        C ->A B D
        D ->A C G
        E ->A
        F ->A
        G ->D H K
        H ->G I
        I ->H J
        J ->I K
        K ->G J
     */
    
}

console.log('测试图的构造')
testGraph()


/*---------------------------------------------------------------------------testBfs---------------------------------------------*/

const visitNodeCB = (node)=>{
    console.log(`访问定点:${node}`)
}

// 测试图的广度优先搜索
const testBfs = ()=>{
    console.log('测试图的广度优先搜索')
    const graph = new Graph()
    const myVertices = ['A','B','C','D','E','F','G','H','I','J','K']
    // 给图添加定点
    myVertices.forEach(d=>{
        graph.addVertex(d)
    })
    graph.addEdge('A','B')
    graph.addEdge('A','C')
    graph.addEdge('A','D')
    graph.addEdge('A','E')
    graph.addEdge('A','F')
    graph.addEdge('B','C')
    graph.addEdge('C','D')
    graph.addEdge('D','G')
    graph.addEdge('G','H')
    graph.addEdge('H','I')
    graph.addEdge('I','J')
    graph.addEdge('G','K')
    graph.addEdge('J','K')
    graph.bfs('A',visitNodeCB)
    
   console.log('广度优先最短路径分析')
   const minDis = graph.bfsMinDistances('A',visitNodeCB)
   console.log(JSON.stringify(minDis))
}

testBfs()


// function aaa (){
//     return {
//         bbb:function(){
//             console.log(000)
//         }
//     }
// }

// class ccc{
//     ddd(){
//         console.log('ddd')
//     }
// }

// const a = new aaa()
// a.bbb()

// const d = new ccc() 
// d.ddd()



