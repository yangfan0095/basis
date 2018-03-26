
##### React 总结

###### 基础
* 元素渲染 
* 组件渲染 & Props
* state  生命周期
* 事件处理
* 条件渲染
* 列表 & key  [协调算法](https://doc.react-china.org/docs/reconciliation.html#%E9%80%92%E5%BD%92%E5%AD%90%E8%8A%82%E7%82%B9)
* 表单
* 状态提升
* 组合vs继承
* 理念

 使用 React 构建组件和应用程序。虽然这可能会比以前编写更多的代码，代码是用来读的，这比写更重要，并且非常容易阅读这个模块化的，思路清晰的代码。当你开始构建大型组件库的时候，你会开始欣赏 React 的思路清晰化和模块性，并且随着代码的复用，你的代码量会 开始减少。
 
 书籍《深入React技术栈》
 
 ##### 进阶
 * JSX 相关知识
 * prop-type 类型检查
 * refs & dom 
 * 非受控组件  [受控组件与非受控组件](http://goshakkk.name/controlled-vs-uncontrolled-inputs-react/) 
 * 性能优化
 * [协调算法](https://doc.react-china.org/docs/reconciliation.html#%E9%80%92%E5%BD%92%E5%AD%90%E8%8A%82%E7%82%B9)
 * 错误边界
 * 高阶组件
 * render props
 * 




#### 详细描述
###### refs
正常情况下 props 是父子组件交互的唯一方式，我们通过传入新的props 渲染子组件，但是某些场景我们需要在数据流之外强行修改子代 （react 组件实例 或者 dom），这里react 提供了 refs
* 1 处理焦点、文本选择或媒体控制。
* 2 触发强制动画。
* 3 集成第三方 DOM 库

当 ref 属性用于使用 class 声明的自定义组件时，ref 的回调接收的是已经加载的 React 实例

不能在函数式组件上使用 ref 属性，因为它们没有实例

使用原则：如果可以通过声明式实现，则尽量避免使用 refs

###### 性能优化
* 1 使用生产版本
* 2 使用google 开发者工具如[Chrome Performance](https://developers.google.com/web/tools/chrome-devtools/evaluate-performance/timeline-tool)  分析性能  [介绍文章](https://building.calibreapp.com/debugging-react-performance-with-react-16-and-chrome-devtools-c90698a522ad)
* 避免重复渲染
* shouldComponentUpdate() 周期判断是否需要更新组件。
如下例

```
class CounterButton extends React.Component {
  constructor(props) {
    super(props);
    this.state = {count: 1};
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (this.props.color !== nextProps.color) {
      return true;
    }
    if (this.state.count !== nextState.count) {
      return true;
    }
    return false;
  }

  render() {
    return (
      <button
        color={this.props.color}
        onClick={() => this.setState(state => ({count: state.count + 1}))}>
        Count: {this.state.count}
      </button>
    );
  }
}
```
使用PureComponent 注意使用PureComponent 是做的浅比较，如果改变的是 引用形对象 则会出现无效的情况，

react 源码
```
if (this._compositeType === CompositeTypes.PureClass) {
  shouldUpdate = !shallowEqual(prevProps, nextProps) || ! shallowEqual(inst.state, nextState);
}

```
详细参考
[文章链接](http://www.zcfy.cc/article/why-and-how-to-use-purecomponent-in-react-js-60devs)
无效 

```
handleClick() {
  let {items} = this.state

  items.push('new-item')
  this.setState({ items })
}

render() {
  return (
    <div>
      <button onClick={this.handleClick} />
      <ItemList items={this.state.items} />
    </div>
  )
}

```
有效 直接改变引用值

```
handleClick() {
  this.setState(prevState => ({
    words: prevState.items.concat(['new-item'])
  }));
}
```
总结一下 一般数组 通过 [ ...arr1,...arr2] 或者 contact  一般对象用 object.assign({} ,obj1,obj2)

* 使用不可突变的数据结构

使用 immutable.js是解决这个问题的另一种方法。它通过结构共享提供不可突变的，持久的集合：

不可突变:一旦创建，集合就不能在另一个时间点改变。

持久性:可以使用原始集合和一个突变来创建新的集合。
原始集合在新集合创建后仍然可用。

结构共享:新集合尽可能多的使用原始集合的结构来创建，以便将复制操作降至最少从而提升性能。

