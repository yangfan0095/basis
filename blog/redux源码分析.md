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
##### createStore概括

文件对外导出的`createStore`，该方法的主要作用是创建一个带有初始化状态树的store。并且该状态树下的状态只能够通过 `createStore`提供的dispatch api 来修改。

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
方法有三个参数 reducer ，preloadedState ，enhancer。其中reducer 是一个方法更来更新state。 preloadedState 是初始化state数据 ，`enhancer` 是一个高阶函数用于拓展store的功能 ， 如redux 自带的模块`applyMiddleware`就是一个`enhancer`函数。

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
这里总结一下，通过这个enhancer我们可以改变dispatch 的行为。 其实这个例子是通过在enhancer 方法中定义新的dispatch覆盖store中的dispatch来使用户访问到新的dispatch。除此之外还可以看`applyMiddleware`这个方法，这个我们后面再讲。

接下来我们看到这里，配置了一些变量 ,初始化时 将初始化数据preloadedState 赋值给`currentState` 。这些变量实际上是一个闭包，保存一些全局数据。

```
  let currentReducer = reducer
  let currentState = preloadedState
  let currentListeners = []
  let nextListeners = currentListeners
  let isDispatching = false
  ...
  
```
##### subscribe 方法

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


##### ensureCanMutateNextListeners 函数
关于`ensureCanMutateNextListeners`函数的作用，我看了很多类似的源码分析，但是都没有找到很好的解释。大抵上的作用是某些场景可能会导重复的listener被添加，从而导致当前订阅者列表中存在两个相同的处理函数。`ensureCanMutateNextListeners`的作用是为了规避这种现象发生。
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

##### dispatch方法

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
##### replaceReducer 方法
replaceReducer 方法用于动态更新当前`currentReducer` 。 通过对外暴露replaceReducer API, 外部可以直接调用这个方法来替换当前`currentReducer`。然后执行`dispatch({ type: ActionTypes.INIT })` 其实相当于一个初始化的createStore操作。` dispatch({ type: ActionTypes.INIT })`的作用是当store被创建时，一个初始化的action `{ type: ActionTypes.INIT }` 被分发当前所有的reducer ，reducer返回它们的初始值，这样就生成了一个初始化的状态树。

```
  function replaceReducer(nextReducer) {
    if (typeof nextReducer !== 'function') {
      throw new Error('Expected the nextReducer to be a function.')
    }

    currentReducer = nextReducer
    dispatch({ type: ActionTypes.INIT })
  }
  
```
##### getState 方法
返回当前状态树
```
  function getState() {
    return currentState
  }
  
```
##### observable方法

observable 是通过私有属性被暴露出去的 ，只供内部使用。
该函数对外返回一个`subscribe`方法，该方法可以用来观察最小单位的state 状态的改变。
这个方法的参数 observer 是一个具有next （类型为Function） 属性的对象。

如下源码所示：
函数首先将createStore 下的`subscribe`方法赋值给`outerSubscribe`，在起返回的方法中 首先定义函数observeState ,然后将其传入`outeSubscribe`。实际上是封装了一个linster 引用`subscribe`来做订阅。当消息被分发时，就出发了这个 linster ，然后next方法下调用` observer.next(getState())` 就获取到了当前的state
```
    function observeState() {
          if (observer.next) {
            observer.next(getState())
          }
        }
    observeState()
    const unsubscribe = outerSubscribe(observeState)
        
```

要获取更多关于observable 的信息可以查看[https://github.com/tc39/proposal-observable](https://github.com/tc39/proposal-observable)
```
function observable() {
    const outerSubscribe = subscribe
    return {
      subscribe(observer) {
        if (typeof observer !== 'object') {
          thr[$$observable]: observableow new TypeError('Expected the observer to be an object.')
        }

        function observeState() {
          if (observer.next) {
            observer.next(getState())
          }
        }
       
       //获取观察着的状态 并返回一个取消订阅的方法。
        observeState()
        const unsubscribe = outerSubscribe(observeState)
        return { unsubscribe }
      },

      [$$observable]() {
        return this
      }
    }
  }
  
  
```
createStore 到这里就讲完了，它是redux里面最核心的一个方法。里面提供了完整的观察订阅方法API 给第三方。

#### bindActionCreators
```
export default function bindActionCreators(actionCreators, dispatch) {
  if (typeof actionCreators === 'function') {
    return bindActionCreator(actionCreators, dispatch)
  }

  if (typeof actionCreators !== 'object' || actionCreators === null) {
    throw new Error(
      `bindActionCreators expected an object or a function, instead received ${actionCreators === null ? 'null' : typeof actionCreators}. ` +
      `Did you write "import ActionCreators from" instead of "import * as ActionCreators from"?`
    )
  }

  const keys = Object.keys(actionCreators)
  const boundActionCreators = {}
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i]
    const actionCreator = actionCreators[key]
    if (typeof actionCreator === 'function') {
      boundActionCreators[key] = bindActionCreator(actionCreator, dispatch)
    }
  }
  return boundActionCreators
}

function bindActionCreator(actionCreator, dispatch) {
  return (...args) => dispatch(actionCreator(...args))
}

```
我们可以重点来看 `bindActionCreator`方法，这个方法很简单 直接传入一个原始action 对象 ，和 dispatch方法。返回一个分发action 的方法`(...args) => dispatch(actionCreator(...args))`。 
我们一个原始的action 对象如下
```
 export function addTodo(text) {
  return {
    type: 'ADD_TODO',
    text
  }
}
```
例如react 中我们获取到了更新的状态值 要手动通过dispatch 去执行对应的reducer （listener ）函数来更新状态数state 
```
dispatch(addTodo)
```
这里相当于是直接将我们手动dispatch的方法封装起来。action 实际变成了
`(...args) => dispatch(actionCreator(...args))` 我们执行的时候 自动完成了dispatch操作。
`bindActionCreators` 方法对我们的 对应文件导出的action方法 进行遍历 分别执行`bindActionCreator` 最后返回一个更新后的action集合`boundActionCreators`。

#### combineReducers
作用是将多个reducer 合并成一个reducer ,返回一个`combination` 方法。 `combination` 也就是`createStore`操作传入的reducer 。这个方法接受一个state 一个action返回一个最新的状态数

例如我们在执行dispatch时会调用` currentState = currentReducer(currentState, action)` 这行代码来更新当前的状态树， 然后执行 订阅者回调函数listener 更新订阅者 （如react 组件）的state 。
```
export default function combineReducers(reducers) {
  const reducerKeys = Object.keys(reducers)
  // 校验合法性  然后获取当前所有 reducer 对象
  const finalReducers = {}
  for (let i = 0; i < reducerKeys.length; i++) {
    const key = reducerKeys[i]

    if (process.env.NODE_ENV !== 'production') {
      if (typeof reducers[key] === 'undefined') {
        warning(`No reducer provided for key "${key}"`)
      }
    }

    if (typeof reducers[key] === 'function') {
      finalReducers[key] = reducers[key]
    }
  }
  const finalReducerKeys = Object.keys(finalReducers)

  let unexpectedKeyCache
  if (process.env.NODE_ENV !== 'production') {
    unexpectedKeyCache = {}
  }

// 调用 assertReducerShape  判断单个reducer函数合法性
  let shapeAssertionError
  try {
    assertReducerShape(finalReducers)
  } catch (e) {
    shapeAssertionError = e
  }

// 返回一个combination方法 这个方法传入state 和action  返回一个新的状态树
  return function combination(state = {}, action) {
    if (shapeAssertionError) {
      throw shapeAssertionError
    }

    if (process.env.NODE_ENV !== 'production') {
      const warningMessage = getUnexpectedStateShapeWarningMessage(state, finalReducers, action, unexpectedKeyCache)
      if (warningMessage) {
        warning(warningMessage)
      }
    }

    let hasChanged = false
    const nextState = {}
    for (let i = 0; i < finalReducerKeys.length; i++) {
      const key = finalReducerKeys[i]
      const reducer = finalReducers[key]
      const previousStateForKey = state[key]
      const nextStateForKey = reducer(previousStateForKey, action)
      if (typeof nextStateForKey === 'undefined') {
        const errorMessage = getUndefinedStateErrorMessage(key, action)
        throw new Error(errorMessage)
      }
      nextState[key] = nextStateForKey
      hasChanged = hasChanged || nextStateForKey !== previousStateForKey
    }
    return hasChanged ? nextState : state
  }
}

```

#### applyMiddleware

这里的applyMiddleware 是一个enhancer 方法用来增强store的dispatch 功能，这里用来合并中间件。首先将所有中间件push 到一个数组chain中。
然后执行compose函数。 `compose` 函数，借助了数组的 reduce 方法对数组的参数进行迭代，返回一个方法 这个方法一执行就会从数组下标0开始依次执行所有的中间件函数。这里将这个返回的compose方法赋给dispatch
```
export default function applyMiddleware(...middlewares) {
  return (createStore) => (reducer, preloadedState, enhancer) => {
    const store = createStore(reducer, preloadedState, enhancer)
    let dispatch = store.dispatch
    let chain = []

    const middlewareAPI = {
      getState: store.getState,
      dispatch: (action) => dispatch(action)
    }
    chain = middlewares.map(middleware => middleware(middlewareAPI))
    dispatch = compose(...chain)(store.dispatch)

    return {
      ...store,
      dispatch
    }
  }
}

```
```
export default function compose(...funcs) {
  if (funcs.length === 0) {
    return arg => arg
  }

  if (funcs.length === 1) {
    return funcs[0]
  }

  return funcs.reduce((a, b) => (...args) => a(b(...args)))
}


```
参考资料

* [https://techblog.toutiao.com/2017/04/25/redux/](https://techblog.toutiao.com/2017/04/25/redux/)