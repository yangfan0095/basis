### Redux 源码分析

##### 前言 
最近做项目遇到了一些复杂数据处理，侧面体会到一个良好的数据层设计和管理对一个项目的稳定性和可维护性是多么的重要。于是想以源码分析的方式总结一下当前的数据管理方式，首选redux。
我们可以通过Redux 的官方文档来了解其设计思想。
[http://cn.redux.js.org/](http://cn.redux.js.org/).

##### Redux 源码入口 index.js
我们可以看到 Redux 对外导出了以下5个模块。分别对应5个js文件。
```
import createStore from './createStore'
import combineReducers from './combineReducers'
import bindActionCreators from './bindActionCreators'
import applyMiddleware from './applyMiddleware'
import compose from './compose'
...
export {
  createStore,
  combineReducers,
  bindActionCreators,
  applyMiddleware,
  compose
}

```

  * createStore  作用： 创建store
  
  * combineReducers 作用： 合并reducer
  
  * bindActionCreators 作用： 把一个 value 为不同 action creator 的对象，转成拥有同名 key 的对象 
  
  * applyMiddleware 作用：通过自定义中间件拓展Redux 介绍
  
* compose 作用： 从右到左来组合多个函数 

其中最主要的文件就是 createStore 。

#### createStore

文件对外导出的`createStore`，该方法的主要作用是创建一个带有初始化状态树的store。并且改store下的状态只能够通过 `createStore`提供的dispatch api 来操作。

```
import isPlainObject from 'lodash/isPlainObject'
import $$observable from 'symbol-observable'

export default function createStore(reducer, preloadedState, enhancer) {
  if (typeof preloadedState === 'function' && typeof enhancer === 'undefined') {
    enhancer = preloadedState
    preloadedState = undefined
  }

  if (typeof enhancer !== 'undefined') {
    if (typeof enhancer !== 'function') {
      throw new Error('Expected the enhancer to be a function.')
    }

    return enhancer(createStore)(reducer, preloadedState)
  }

  if (typeof reducer !== 'function') {
    throw new Error('Expected the reducer to be a function.')
  }
  ...
    
  return {
    dispatch,
    subscribe,
    getState,
    replaceReducer,
    [$$observable]: observable
  }
  
```
方法有三个参数 reducer ，preloadedState ，enhancer。其中reducer 是一个方法更来更新state。 preloadedState 是初始化state数据 ，`enhancer` 是一个高阶函数用于拓展store的功能 ， 如redux 自带的模块`applyMiddleware`就是一个`enhancer`函数，除此之外 初次之外还有第三方包如`redux-thunk`等等。

首先js 函数传递的是形参。源码判断第二个参数的类型，如果是function 那么就说明传入的参数不是initState. 所以就把第二个参数替换成enhancer 。这样提高了我们的开发体验。
```
 if (typeof preloadedState === 'function' && typeof enhancer === 'undefined') {
    enhancer = preloadedState
    preloadedState = undefined
  }

```

关于对于enhancer的操作，如果enhancer 存在 执行则下面这段语句。
```
if (typeof enhancer !== 'undefined') {
    if (typeof enhancer !== 'function') {
      throw new Error('Expected the enhancer to be a function.')
    }

    return enhancer(createStore)(reducer, preloadedState)
  }
  
```
我在网上找了一个例子来了解。 首先enhancer 是一个类似于下面结构的函数。 函数返回一个匿名函数。由于js是传值调用，所以这个enhancer 在 createStore 中执行的时候 已经变成了`createStore => (reducer, initialState, enhancer) => {  ... })` 然后直接执行这个方法。


```
export default function autoLogger() {
  return createStore => (reducer, initialState, enhancer) => {
    const store = createStore(reducer, initialState, enhancer)
    function dispatch(action) {
      console.log(`dispatch an action: ${JSON.stringify(action)}`);
      const result = store.dispatch(action);
      const newState = store.getState();
      console.log(`current state: ${JSON.stringify(newState)}`);
      return result;
    }
    return {...store, dispatch}
  }
}

```
这个总结一下，通过这个enhancer我们可以改变dispatch 的行为。 其实这个例子我个人觉得还是不是很形象 ，他是通过在enhancer 方法中定义新的dispatch覆盖store中的dispatch来使用户访问到新的dispatch。除此之外还可以看`applyMiddleware`这个方法，这个我们后面再讲。

接下来我们看到这里，配置了一些变量 ,初始化时 将初始化数据preloadedState 赋值给`currentState` 。这些变量实际上是一个闭包，保存一些全局数据。

```
  let currentReducer = reducer
  let currentState = preloadedState
  let currentListeners = []
  let nextListeners = currentListeners
  let isDispatching = false
  ...
  
```
###### subscribe 方法

subscribe 方法实现的是一个订阅监听器,参数listener是一个回调函数，在每次执行dispatch后会被调用,如下面代码：
```
function dispatch(action){
    for (let i = 0; i < listeners.length; i++) {
        const listener = listeners[i]
        listener()
    }
    ...
    
```

订阅函数返回一个解除订阅函数`unsubscribe`，传入的监听函数listener将在action 触发 dispatch 时被调用,用这个监听函数去改变状态树中的对应的state。首先订阅器在每次dispatch之前会将listener 保存到nextListeners 中，相当于是一份快照。如果当你正在执行listener函数时，如果此时又收到订阅或者接触订阅指令 ，后者不会立即生效 ，而是在下一次调用`dispatch` 会使用最新的订阅者列表即`nextListeners`。
当调用dispatch时 将最新的订阅者快照`nextListeners` 赋给 `currentListeners`。
[这里有篇博客文章专门讨论了这个话题](https://github.com/MrErHu/blog/issues/18)
```
    const listeners = currentListeners = nextListeners
    for (let i = 0; i < listeners.length; i++) {
      const listener = listeners[i]
      listener()
    }
    
```

关于ensureCanMutateNextListeners函数的作用，我看了很多类似的源码分析，但是都没有找到很好的解释。大抵上的作用是某些场景可能会导重复的listener被添加，从而导致当前订阅者列表中存在两个相同的处理函数。`ensureCanMutateNextListeners`的作用是为了规避这种现象发生。
```
  function ensureCanMutateNextListeners() {
    if (nextListeners === currentListeners) {
      nextListeners = currentListeners.slice()
    }
  }
  
```
当我们以如下方式追加订阅 ，执行dispatch时就会造成重复订阅。
具体的例子可以看这个链接：
[React Redux source function ensureCanMutateNextListeners？
](https://stackoverflow.com/questions/36250266/react-redux-source-function-ensurecanmutatenextlisteners?utm_medium=organic&utm_source=google_rich_qa&utm_campaign=google_rich_qa)
```
const store = createStore(someReducer);

function doSubscribe() {
  store.subscribe(doSubscribe);
}
doSubscribe(); 

```
```
 function subscribe(listener) {
    if (typeof listener !== 'function') {
      throw new Error('Expected listener to be a function.')
    }

    let isSubscribed = true

    ensureCanMutateNextListeners()
    nextListeners.push(listener)

    return function unsubscribe() {
      if (!isSubscribed) {
        return
      }

      isSubscribed = false

      ensureCanMutateNextListeners()
      const index = nextListeners.indexOf(listener)
      nextListeners.splice(index, 1)
    }
  }
```
###### dispatch方法

我们来看dispatch函数，dispatch 用来分发一个action ,触发状态改变。这里是内部的dispatch 方法， 传入的action 只能是最朴素的action 对象。 包含一个state 和 type 属性。 如果需要action 支持promise ,可以使用 [redux-promise](https://github.com/redux-utilities/redux-promise) 它的本质是一个中间件。 在其内部对action做处理，并最终传递一个朴素的action 对象到dispatch方法中。
```
   function dispatch(action) {
    if (!isPlainObject(action)) {
      throw new Error(
        'Actions must be plain objects. ' +
        'Use custom middleware for async actions.'
      )
    }

    if (typeof action.type === 'undefined') {
      throw new Error(
        'Actions may not have an undefined "type" property. ' +
        'Have you misspelled a constant?'
      )
    }

    if (isDispatching) {
      throw new Error('Reducers may not dispatch actions.')
    }

    try {
      isDispatching = true
      currentState = currentReducer(currentState, action)
    } finally {
      isDispatching = false
    }

    const listeners = currentListeners = nextListeners
    for (let i = 0; i < listeners.length; i++) {
      const listener = listeners[i]
      listener()
    }

    return action
  }
  
```

首先 dispatch 通过第三方引入的方法判断`isPlainObject`先判断 action 类型是否合法 。然后将当前的state  和action  传入 `currentReducer` 函数中 ，`currentReducer` 处理得到最新的state 赋值给currentState。然后触发所有已更新的 listener 来更新state 
```
 try {
      isDispatching = true
      currentState = currentReducer(currentState, action)
    } finally {
      isDispatching = false
    }

    const listeners = currentListeners = nextListeners
    for (let i = 0; i < listeners.length; i++) {
      const listener = listeners[i]
      listener()
    }
    
```





参考资料

* [https://techblog.toutiao.com/2017/04/25/redux/](https://techblog.toutiao.com/2017/04/25/redux/)