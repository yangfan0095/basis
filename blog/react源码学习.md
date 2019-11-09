## 前言
最近部门在搞OKR ,感觉可以用OKR的方式来研究React ,简单粗暴而高效！
[OKR 目标与关键成果法简介](https://baike.baidu.com/item/OKR/2996251?fr=aladdin)

## 要研究React 我们可以设置以下要实现的目标
* Objective1 : 管中窥豹，先实现一个简单的react，来熟悉react的主要脉络

* Objective2 : 分析0.3-stable版本react源码

* Objective3 : 依据react版本进程梳理其设计思想并做总结


### Objective1 管中窥豹，先实现一个简单的react，来熟悉react的主要脉络
要完成这个目标 我们要分步实现 ：

PS:我们的主要目的是为了梳理react 的主要脉络，所以这里直接拿了一个demo来用了 [https://github.com/hujiulong/simple-react](https://github.com/hujiulong/simple-react)

##### Key Result1: createElement  和 VirtualDom
* step1 : 基于jsx 生成 AST代码 
* step2 : 通过 createElement 方法得到 vnode 
* step3 : render 方法实现 ，调用 ReactDOM.render(vnode, container)  将vnode 生成 真实的dom

##### Key Result2: 实现组件的挂载 和 组件的生命周期
* step1 : 实现组件基类 React.Component ，初始化 state,props
* step2 : 实现简化的setState方法，通过renderComponent方法重新渲染组件
* step3.1 : 在ReactDOM.render方法中 增加对组件的判断 ， 递归计算组件，最终将组件生成vnode
* step3.2 : 通过createComponent 创建组件实例 、setComponentProps 更新组件props, renderComponent 方法来递归生成Component最终对应的vnode 并在后两个方法中加入对钩子函数的判断 （从而可以对组件的生命周期进行操作）

##### Key Result3: 实现diff算法优化react性能
*  step1 : 文本节点diff
*  step2 : 分文本节点diff
*  step3 : 属性diff
*  step4 : 子节点diff
*  step5 : 组件diff

##### Key Result4： 实现异步处理 setState （实现 setState的异步更新 将多个 setState 合并为一个 ， 通过setState 方法接受函数 实现异步更新）
* step1 : 通过 enqueueSetState 方法对 setState 进行合并,setStateQueue 队列 保存当前所有setState 更新的数据 ，
renderQueue 队列 保存所有唯一的需要更新的组件,当清空完成 或者初始化时 清空当前队列，更新所有需要更新的组件 并渲染 
```
const setStateQueue = [];  
const renderQueue = [];

function defer( fn ) {
    return Promise.resolve().then( fn );
}

export function enqueueSetState( stateChange, component ) {

    if ( setStateQueue.length === 0 ) {
         // defer( flush );
         Promise.resolve().then( flush )
    }
    setStateQueue.push( {
        stateChange,
        component
    } );

    if ( !renderQueue.some( item => item === component ) ) {
        renderQueue.push( component );
    }
}
```
* step2 : 实现flush 方法用于清空队列，更新当前最新的state, 并渲染组件 
```
function flush() {
    let item, component;

    /* eslint-disable-next-line no-cond-assign */
    while ( item = setStateQueue.shift() ) {

        const { stateChange, component } = item;

        // 如果没有prevState，则将当前的state作为初始的prevState
        if ( !component.prevState ) {
            component.prevState = Object.assign( {}, component.state );
        }

        // 如果stateChange是一个方法，也就是setState的第二种形式
        if ( typeof stateChange === 'function' ) {
            Object.assign( component.state, stateChange( component.prevState, component.props ) );
        } else {
            // 如果stateChange是一个对象，则直接合并到setState中
            Object.assign( component.state, stateChange );
        }

        component.prevState = component.state;

    }

    /* eslint-disable-next-line no-cond-assign */
    while ( component = renderQueue.shift() ) {
        renderComponent( component );
    }

}

```

step3 : 任务延迟，这里利用了Javascript 微任务的执行优先级低于当前任务栈任务 Promise.resolve().then( flush ) 会在当前任务栈中最后执行，所以保证了 清空操作在合并完 N个 setState  后执行 


##### 总结

通过上述几个关键结果的实现，我们大致了解了一个简化版react 主要包含的功能模块，通过这些模块 我们就能运行起一个简单的react 框架。

### Objective2 分析0.3-stable版本react源码
