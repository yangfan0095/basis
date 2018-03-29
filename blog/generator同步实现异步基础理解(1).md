#### generator函数理解

##### 基础知识

要理解generator 首先要了解协程的概念，所谓协程就是多个线程协作 来完成异步任务。

参考阮一峰老师的ES6 标准的介绍
* 第一步，协程A开始执行。
* 第二步，协程A执行到一半，进入暂停，执行权转移到协程B。
* 第三步，（一段时间后）协程B交还执行权。
* 第四步，协程A恢复执行。

generator 函数就是协程在ES6中的实现
具体例子：

```
function* gen(x) {
  var y = yield x + 2;
  return y;
}

var g = gen(1);
g.next() // { value: 3, done: false }
g.next() 


```
整个异步操作需要暂停的地方 都使用yiled 来标记。
同时返回一个对象 包含了 value  和 done 两个属性。
value 表示异步操作表达式的值， done 表示是否执行完成当前所有的yiled。

我们来执行一个真实的异步任务

```
// 定义函数
var fetch = require('node-fetch');

function* gen(){
  var url = 'https://api.github.com/users/github';
  var result = yield fetch(url);
  console.log(result.bio);
}

// 执行函数
var result = g.next();

result.value.then(function(data){
  return data.json();
}).then(function(data){
  g.next(data);
});

```
通过上面这个例子我们可以看到Generator 的异步操作很简洁 ，但是整个程序流程显得比较混乱。这个时候我们需要一种来管理Generator 的流程。如果其流程能够表达的比较清晰，那么我们就可以实现把异步当成同步来写。

目前主要流行的两种方式是 promise 的方式 和 thunk 的方式。

###### thunk 

 所谓传名调用 就是 给函数传递的参数只有在参数参与运算时 才去计算参数的值 ，这样能够提升计算机性能吧。
 
thunk函数是一种传名调用”的一种实现策略
。用来替换表达式如代码所示。

```
function f(m) {
  return m * 2;
}

f(x + 5);

// 等同于

var thunk = function () {
  return x + 5;
};

function f(thunk) {
  return thunk() * 2;
}


```
一般的异步操作 比如文件读取 ，都是使用fn(argu,callback) 形式的。我们现在要把带有回调的函数 写成 thunk 函数的形式。

```
// 正常版本的readFile（多参数版本）
fs.readFile(fileName, callback);

// Thunk版本的readFile（单参数版本）
var Thunk = function (fileName) {
  return function (callback) {
    return fs.readFile(fileName, callback);
  };
};

var readFileThunk = Thunk(fileName);
readFileThunk(callback);

```
thunk函数封装

```

const Thunk = function(fn) {
  return function (...args) {
    return function (callback) {
      return fn.call(this, ...args, callback);
    }
  };
};

var readFileThunk = Thunk(fs.readFile);
readFileThunk(fileA)(callback);

```
这样的好处是 我们不需要再异步里面去写回调。 把参数有回调的函数变成了一个单个参数的函数带一个接收回调函数作为参数。

Thunkify模块 是一个封装好的 thunk 模块。后面会有分析

上面说了这么多好像单单的thunk 没什么用途 .但是跟Generator 结合 就可以实现自动的去管理流程。

```
function run(fn) {
  var gen = fn();

  function next(err, data) {
    var result = gen.next(data);
    if (result.done) return;
    result.value(next); // 这一行是执行callback
  }

  next();
}

var g = function* (){
  var f1 = yield readFileThunk('fileA');
  var f2 = yield readFileThunk('fileB');
  // ...
  var fn = yield readFileThunk('fileN');
};

run(g);


```

对比下面的来看
```
var fs = require('fs');
var thunkify = require('thunkify');
var readFileThunk = thunkify(fs.readFile);

var gen = function* (){
  var r1 = yield readFileThunk('/etc/fstab');
  console.log(r1.toString());
  var r2 = yield readFileThunk('/etc/shells');
  console.log(r2.toString());
};


var r1 = g.next();
r1.value(function (err, data) {
  if (err) throw err;
  var r2 = g.next(data);
  r2.value(function (err, data) {
    if (err) throw err;
    g.next(data);
  });
});


```
我们可以看到 这个下面的执行流程里面的回调函数都是一样的 如果错误抛出 否则 执行下一个遍历next() .我们把 回调统一起来， 用递归的形式来自动完成遍历
```
 function next(err, data) {
    var result = gen.next(data);
    if (result.done) return;
    result.value(next); // 这一行是执行 thunk(argus)(callback) ,next 就是callback
  }

  next();
  
```
通过这种机制 我们就可以像同步一样去操作异步了。这就是 thunk 方式。

##### Promise 方式同理

```

var fs = require('fs');

var readFile = function (fileName){
  return new Promise(function (resolve, reject){
    fs.readFile(fileName, function(error, data){
      if (error) return reject(error);
      resolve(data);
    });
  });
};

var gen = function* (){
  var f1 = yield readFile('/etc/fstab');
  var f2 = yield readFile('/etc/shells');
  console.log(f1.toString());
  console.log(f2.toString());
};


```
自动执行
```
function run(gen){
  var g = gen();

  function next(data){
    var result = g.next(data);
    if (result.done) return result.value;
    result.value.then(function(data){
      next(data); // 执行回调
    });
  }

  next();
}

run(gen);
```
对比手动执行
```
var g = gen();

g.next().value.then(function(data){
  g.next(data).value.then(function(data){
    g.next(data);
  });
});
```
理解 : 重点是通过thunk 或者 promise 的方式将参数和回调方法 分离开来。 利用递归 的方式执行遍历器下面的异步操作。
