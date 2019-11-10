###  promise 实现方式本质探究

首先 promsie 拥有三种状态 未完成 完成态 和 失败态
说白了promise 要做的事情就是 执行一个异步， 把异步的结果（resolve  ,reject ）消息告诉 Promise.then ，然后Promise.then 根据结果状态 执行不同的回调。

这里为了简化模型，选用了commonJs 提案的Primise/A 来做简要介绍
commonJs 是运行在node 上的模块化方案

Primise/A 包括promise/Deffered 两个部分

promise部分

```
class Promise extend EventEmitter{

    then(success,error,progress){

    }

}

```

#### 生活不止眼前的苟且

好想能够沉下心来能做自己喜欢做的事情，比如沉下心来下代码，学美术。

