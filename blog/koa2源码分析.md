## koa2 源码分析

最近想做一个关于NodeJS 服务端相关的总结，思前想后觉得可以从源码分析作为切入点。于是首先便选择了koa2.

注：由于书写习惯原因 ，下文中所有出现koa的字眼 皆指的是koa2.x版本。如果是1.x版本则用koa1.x标明。

本文章写在我的github仓库 [https://github.com/yangfan0095/basis](https://github.com/yangfan0095/basis)

首先进入koa2 的文件目录 ，我们可以看到只有只有四个文件
[https://github.com/koajs/koa/tree/master/lib](https://github.com/koajs/koa/tree/master/lib).
分别是
* application.js  
* context.js
* request.js
* response.js

application.js 是项目的入口文件，对外输出一个class  ,这个class 就是koa 实例。
源码如下：
```
module.exports = class Application extends Emitter {
  /**
   * Initialize a new `Application`.
   *
   * @api public
   */

  constructor() {
    super();

    this.proxy = false;
    this.middleware = [];
    this.subdomainOffset = 2;
    this.env = process.env.NODE_ENV || 'development';
    this.context = Object.create(context);
    this.request = Object.create(request);
    this.response = Object.create(response);
  }
  ...
```
### 先从外层剖析

首先我们先看看koa2的正常使用逻辑。 以下是一个有koa2脚手架生成的一个初始化项目

```

const Koa = require('koa')
const app = new Koa()
...

// middlewares
app.use(bodyparser({
  enableTypes:['json', 'form', 'text']
}))
app.use(json())
app.use(logger())
app.use(require('koa-static')(__dirname + '/public'))

app.use(views(__dirname + '/views', {
  extension: 'pug'
}))

// logger
app.use(async (ctx, next) => {
  const start = new Date()
  await next()
  const ms = new Date() - start
  console.log(`${ctx.method} ${ctx.url} - ${ms}ms`)
})

// routes
app.use(index.routes(), index.allowedMethods())
app.use(users.routes(), users.allowedMethods())

// error-handling
app.on('error', (err, ctx) => {
  console.error('server error', err, ctx)
});


var http = require('http');
var server = http.createServer(app.callback());
server.listen(port);


```
可以看到koa的核心非常简要。就是初始化一个实例 在实例中传入一系列中间件。
然后我们创建一个http服务器， 将koa实例下的回调函数传入其中。 即app.callback();
然后就可以开始监听服务了。
先对比一下原生http 服务的创建

```
const http = require('http')
const server = http.createServer((req, res) => {
})
server.listen(3000, () => {
  console.log('server listening at 3000 port!')
})

```




这里我们可以关注到看两点
* 1 koa 服务主要是在做中间件处理
* 2 koa 对原生http 创建方法的回调做了处理,原生是 `(req,res) =>{ }`, koa 对齐做了封装 封装成了 koa.callback()。 

### 进入application.js  查看koa实例

#### 构造
我们重点关注中间件处理和对http 的 req res  请求返回流的处理。
下面来逐一分析 application 的源码

```
module.exports = class Application extends Emitter {
  /**
   * Initialize a new `Application`.
   *
   * @api public
   */

  constructor() {
    super();

    this.proxy = false;// 是否信任 proxy header 参数，默认为 false
    this.middleware = []; //保存中间件函数的数组
    this.subdomainOffset = 2;// 不懂
    this.env = process.env.NODE_ENV || 'development';// 环境变量
    
    // 将 context.js  request.js response.js 分别赋值到该实例下
    this.context = Object.create(context); 
    this.request = Object.create(request); 
    this.response = Object.create(response);
  }
  ...
```
#### listen 方法
listen 方法 我们可以看到 listen 是已经封装好了一个 创建http服务的方法 这个方法传入一个 该实例的回调  即 app.callback() ，返回一个监听方法。所以服务 也可以直接通过app.listen(...arg) 启动
```
  /**
   * Shorthand for:
   *
   *    http.createServer(app.callback()).listen(...)
   *
   * @param {Mixed} ...
   * @return {Server}
   * @api public
   */

  listen(...args) {
    debug('listen');
    const server = http.createServer(this.callback());
    return server.listen(...args);
  }
  
```
#### use 
接下来就是use方法 主要做的事情就是 传入一个中间件方法 将中间件push到this.middleware 数组. ` this.middleware.push(fn); `  其实use 最关键的的就只有这一行代码。

除此之外作者还提醒我们，传入中间件的Fn不要写成generator 函数。 原因是因为 koa2是基于 async await 处理异步。 async 和 await 是ES7 新增的语法 本质是对 generator 函数做的一层封装 。 实现了异步变同步的写法， 更够更清晰的反映出函数控制流。相似功能的库在koa1.x 还有一个co 库 非常有名，实现原理也很简单 主要是两种方式 用thunk 或者 Promise 结合递归都可以实现。 大家感兴趣可以看阮一峰老师的ES6标准 里面就有提到 [Generator 函数的异步应用 传送门](http://es6.ruanyifeng.com/#docs/generator-async)。

```
 /**
   * Use the given middleware `fn`.
   *
   * Old-style middleware will be converted.
   *
   * @param {Function} fn
   * @return {Application} self
   * @api public
   */

  use(fn) {
    if (typeof fn !== 'function') throw new TypeError('middleware must be a function!');
    if (isGeneratorFunction(fn)) {
      deprecate('Support for generators will be removed in v3. ' +
                'See the documentation for examples of how to convert old middleware ' +
                'https://github.com/koajs/koa/blob/master/docs/migration.md');
      fn = convert(fn);
    }
    debug('use %s', fn._name || fn.name || '-');
    this.middleware.push(fn);
    return this;
  }
  
```
接下来我们就看到了 最关键的callback 方法了.
callback 对node原生http返回一个handler callback。
第一行代码 将存放中间件函数的数组 this.middleware 通过compose 函数处理得到一个 fn。

#### callback 方法

 ```

  /**
   * Return a request handler callback
   * for node's native http server.
   *
   * @return {Function}
   * @api public
   */

  callback() {
    const fn = compose(this.middleware);

    if (!this.listeners('error').length) this.on('error', this.onerror);

    const handleRequest = (req, res) => {
      const ctx = this.createContext(req, res);
      return this.handleRequest(ctx, fn);
    };

    return handleRequest;
  }
  
```
#### compose 函数
compose 函数前端用过 redux 的同学肯定都很熟悉。redux 通过compose来处理 中间件 。 原理是 借助数组的 reduce 对数组的参数进行迭代，而我们来看看kos实现compose的方法。感觉扯远了。

```
// redux 中的compose 函数

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
言归正传，koa 实例中的compose是作为一个包引入的 ， `koa-compose`  源代码如下
```

/**
 * Compose `middleware` returning
 * a fully valid middleware comprised
 * of all those which are passed.
 *
 * @param {Array} middleware
 * @return {Function}
 * @api public
 */

function compose (middleware) {
  if (!Array.isArray(middleware)) throw new TypeError('Middleware stack must be an array!')
  for (const fn of middleware) {
    if (typeof fn !== 'function') throw new TypeError('Middleware must be composed of functions!')
  }

  /**
   * @param {Object} context
   * @return {Promise}
   * @api public
   */

  return function (context, next) {
    // last called middleware #
    let index = -1
    return dispatch(0)
    function dispatch (i) {
      if (i <= index) return Promise.reject(new Error('next() called multiple times'))
      index = i
      let fn = middleware[i]
      if (i === middleware.length) fn = next
      if (!fn) return Promise.resolve()
      try {
        return Promise.resolve(fn(context, function next () {
          return dispatch(i + 1)
        }))
      } catch (err) {
        return Promise.reject(err)
      }
    }
  }
}


```
这个compose函数 返回一个函数， 这个函数执行则可以 通过一个递归去遍历执行所有的中间件函数。通过在`Promise.resolve(fn) `的回调中执行fn  即实现了对异步函数的处理。我们可以关注一下 最初是执行的是
dispatch(0) 也就是this.middleware数组中下标为0的函数.
此处较为关键的一段代码实现了洋葱模型
```
Promise.resolve(fn(context, function next () {
          return dispatch(i + 1)
        }))
        
```
此处 next() 为 
```
function next () {
          return dispatch(i + 1)
        })
        
```

我们在写中间件时 通常规范为如下代码 ，我们一步一步 从0 到 n 执行  await next() 就相当于将函数控制权暂时交回给了 next() ，等到next()执行完毕 ，再逐次收回控制权执行中间件其余代码 。 这就是所谓的洋葱模型

```
app.use(async (ctx, next) => {
  await next();
  const rt = ctx.response.get('X-Response-Time');
  console.log(`${ctx.method} ${ctx.url} - ${rt}`);
});

// x-response-time

app.use(async (ctx, next) => {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;
  ctx.set('X-Response-Time', `${ms}ms`);
});

```


执行完成以后 执行next() 到下一步处理。
这个时候我们再看第一行 `const fn = compose(this.middleware); ` 。
 fn 实际上是一个待执行所有中间件的方法 。
 我们再回顾一下callback()
 ```
   callback() {
    const fn = compose(this.middleware);

    if (!this.listeners('error').length) this.on('error', this.onerror);

    const handleRequest = (req, res) => {
      const ctx = this.createContext(req, res);
      return this.handleRequest(ctx, fn);
    };

    return handleRequest;
  }
  
 ```
 首先 我们取到了 能够一次性执行所有中间件函数的fn . callback 返回一个方法。
 这个方法输入 原生创建http函数的 req,res 流 并对其进行封装成一个context 对象。并调用handleRequest 方法返回 ` handleRequest(ctx,fn) `  。
 
看到这里其实关键步骤就已经很清晰了剩下只关注 
 
 * koa 如何将req res 包装到ctx
 * handleRequest 如何处理ctx 和 fn
 

####  createContext方法

createContext 将req 和 res 分别挂载到context 对象上。
```
    const request = context.request = Object.create(this.request);
    const response = context.response = Object.create(this.response);
```
并对req 上一些关键的属性进行处理和简化 挂载到该对象本身，简化了对这些属性的调用。
 
```
  /**
   * Initialize a new context.
   *
   * @api private
   */

  createContext(req, res) {
    const context = Object.create(this.context);
    const request = context.request = Object.create(this.request);
    const response = context.response = Object.create(this.response);
    context.app = request.app = response.app = this;
    context.req = request.req = response.req = req;
    context.res = request.res = response.res = res;
    request.ctx = response.ctx = context;
    request.response = response;
    response.request = request;
    context.originalUrl = request.originalUrl = req.url;
    context.cookies = new Cookies(req, res, {
      keys: this.keys,
      secure: request.secure
    });
    request.ip = request.ips[0] || req.socket.remoteAddress || '';
    context.accept = request.accept = accepts(req);
    context.state = {};
    return context;
  }
  
```

 #### handleRequest 方法
 
 handleRequest 方法直接作为监听成功的调用方法。已经拿到了 包含req res 的ctx 和 可以执行所有 中间件函数的fn.
 首先一进来默认设置状态码为404 . 然后分别声明了 成功函数执行完成以后的成功 失败回调方法。这两个方法实际上就是再将ctx 分化成req res . 分别调这两个对象去客户端执行内容返回。
 还有三个文件 context.js  request.js response.js  分别是封装了一些对ctx req res 操作相关的属性。
 
 ```
   /**
   * Handle request in callback.
   *
   * @api private
   */

  handleRequest(ctx, fnMiddleware) {
    const res = ctx.res;
    res.statusCode = 404;
    const onerror = err => ctx.onerror(err);
    const handleResponse = () => respond(ctx);
    onFinished(res, onerror);
    return fnMiddleware(ctx).then(handleResponse).catch(onerror);
  }
  
 ```
失败回调执行

```
  /**
   * Default error handler.
   *
   * @param {Error} err
   * @api private
   */

  onerror(err) {
    assert(err instanceof Error, `non-error thrown: ${err}`);

    if (404 == err.status || err.expose) return;
    if (this.silent) return;

    const msg = err.stack || err.toString();
    console.error();
    console.error(msg.replace(/^/gm, '  '));
    console.error();
  }
};

```
成功回调执行的方法
```
/**
 * Response helper.
 */

function respond(ctx) {
  // allow bypassing koa
  if (false === ctx.respond) return;

  const res = ctx.res;
  if (!ctx.writable) return;

  let body = ctx.body;
  const code = ctx.status;

  // ignore body
  if (statuses.empty[code]) {
    // strip headers
    ctx.body = null;
    return res.end();
  }

  if ('HEAD' == ctx.method) {
    if (!res.headersSent && isJSON(body)) {
      ctx.length = Buffer.byteLength(JSON.stringify(body));
    }
    return res.end();
  }

  // status body
  if (null == body) {
    body = ctx.message || String(code);
    if (!res.headersSent) {
      ctx.type = 'text';
      ctx.length = Buffer.byteLength(body);
    }
    return res.end(body);
  }

  // responses
  if (Buffer.isBuffer(body)) return res.end(body);
  if ('string' == typeof body) return res.end(body);
  if (body instanceof Stream) return body.pipe(res);

  // body: json
  body = JSON.stringify(body);
  if (!res.headersSent) {
    ctx.length = Buffer.byteLength(body);
  }
  res.end(body);
}

```

 讲到这里 其实主要的代码就讲完了。可以看出 koa2 的思想非常简洁。一句话就是由中间件控制所有流程。所以被形象的称为洋葱模型。同时还有一些特色就是 非核心代码都写成了第三方依赖，这样便于生态的发展。 这也是如今很多框架react vue 等的发展的趋势。
 
最后，我写这个的目的也是为了学习，且深感看源码简单要理解真正的精髓还是很难很难。且学且珍惜吧 哈哈 😉 
