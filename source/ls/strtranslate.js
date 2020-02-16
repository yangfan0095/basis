// 判断是否满足 AABBCC
//判断是否满足 AABB
//判断是否满足AAA
const matchAAA = (temp=[])=>{
    for(i=0;i<temp.length;i++){
        for(j=i;j<temp.length;j++){
            if(temp[j] === temp[j+1] && temp[j+1] === temp[j+2]){
                temp[j] = 'tempIndex'
            }
        }
    }
    return temp
    // return temp.filter(d=>d!== null)
    // console.log(temp)
}

const matchAABB = (temp=[])=>{
    for(i=0;i<temp.length;i++){
        for(j=i;j<temp.length;j++){
            if(temp[j] === temp[j+1] && temp[j+2] === temp[j+3] && temp[j+3]){
                temp[j+3] = 'tempIndex'
            }
        }
    }
    return temp
    // return temp.filter(d=>d!== null)
    // console.log(temp)
}
const matchAABBCC = (temp=[])=>{
    for(i=0;i<temp.length;i++){
        for(j=i;j<temp.length;j++){
            if(temp[j] === temp[j+1] && temp[j+2] === temp[j+3] && temp[j+4] === temp[j+5] && temp[j+5]){
                temp[j+3] = 'tempIndex'
            }
        }
    }
     console.log(temp)
    return temp
    // return temp.filter(d=>d!== null)
    // console.log(temp)
}

const translate = (str = '') =>{
    if(!str) return ''
    let temp = []
    // 数组化
    for(i=0;i<str.length;i++){
        temp.push(str[i])
    }
    // const arr1 = temp.concat()

    var arr1 = matchAAA(temp.concat())
    var arr2 = matchAABB(temp.concat())
    var arr3 = matchAABBCC(temp.concat())
    var res = arr3.filter(d=>d!=='tempIndex').join(',')
    console.log(res)
}

// matchAAA('helllo')
// matchAABB('helloo')
// matchAABBCC('helloomm')

translate('helloommlll')

// var reg = /[a-zA-Z]{3}/

// var str = 'helllo'
// var b = str.replace(reg,'')
// reg.exec(str,function(v){
//     constle.log(v)
// })