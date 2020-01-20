#### 前言

#### Js解释器实现


简单 demo

```
const babylon = require("babylon");
const types = require("babel-types");

const visitors = {
  File(node, scope) {
    evaluate(node.program, scope);
  },
  Program(program, scope) {
    for (const node of program.body) {
      evaluate(node, scope);
    }
  },
  ExpressionStatement(node, scope) {
    return evaluate(node.expression, scope);
  },
  CallExpression(node, scope) {
    // 获取调用者对象
    const func = evaluate(node.callee, scope);

    // 获取函数的参数
    const funcArguments = node.arguments.map(arg => evaluate(arg, scope));

    // 如果是获取属性的话: console.log
    if (types.isMemberExpression(node.callee)) {
      const object = evaluate(node.callee.object, scope);
      return func.apply(object, funcArguments); // log.apply(console,'hello world')
    }
  },
  MemberExpression(node, scope) {
    const { object, property } = node;

    // 找到对应的属性名
    const propertyName = property.name;

    // 找对对应的对象
    const obj = evaluate(object, scope);

    // 获取对应的值
    const target = obj[propertyName];

    // 返回这个值，如果这个值是function的话，那么应该绑定上下文this
    return typeof target === "function" ? target.bind(obj) : target;
  },
  Identifier(node, scope) {
    // 获取变量的值
    return scope[node.name];
  },
  StringLiteral(node) {
    return node.value;
  }
};

function evaluate(node, scope) {
  const _evalute = visitors[node.type];
  if (!_evalute) {
    throw new Error(`Unknown visitors of ${node.type}`);
  }
  // 递归调用
  return _evalute(node, scope);
}

const code = "console.log('hello world')";

// 生成AST树
const ast = babylon.parse(code);

// 解析AST
// 需要传入执行上下文，否则找不到``console``对象
evaluate(ast, { console: console });

```


#### 参考文章 

* [Abstract Syntax Tree 抽象语法树简介](https://div.io/topic/1994)
* [基于 C 语言的 JavaScript 引擎探索
](https://www.ibm.com/developerworks/cn/linux/l-cn-spidermonkey/index.html)
* [javascriptCore 相关文章博客](http://lingyuncxb.com/categories/)
* [introduction-to-spidermonkey-exploitation](https://doar-e.github.io/blog/2018/11/19/introduction-to-spidermonkey-exploitation/)
* [https://github.com/jrainlau/canjs](https://github.com/jrainlau/canjs)
* [cs1120 Problem Set 7:
Charming Snakes with Mesmerizing Memoizers](http://www.cs.virginia.edu/~evans/cs1120-f09/ps/ps7/)
* [编译原理之词法分析、语法分析、语义分析
](https://blog.csdn.net/nic_r/article/details/7835908)
* [用 flex 做词法分析](https://pandolia.net/tinyc/ch8_flex.html)
* [js中v8引擎的详解－看的吐血
](https://blog.csdn.net/qq_30638831/article/details/90552912)
* [common lisp](https://acl.readthedocs.io/en/latest/zhCN/index.html)
* [https://github.com/Urinx/SomeCodes/tree/master/Python/Lisp](https://github.com/Urinx/SomeCodes/tree/master/Python/Lisp)