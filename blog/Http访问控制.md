#### Http 访问控制
当一个资源从与该资源本身所在的服务器不同的域或端口请求一个资源时，资源会发起一个跨域 HTTP 请求。
比如常见的一个页面请求另一台服务器上的图片、脚本资源。


出于安全原因，浏览器限制从脚本内发起的跨源HTTP请求。 例如，XMLHttpRequest和Fetch API遵循同源策略。 这意味着使用这些API的Web应用程序只能从加载应用程序的同一个域请求HTTP资源，除非使用CORS头文件。

但是也不是被限制访问的请求一定是被浏览器通过限制的访问的方式去阻止跨域的， 也有可能是访问可以正常发起 ，但是响应的内容被浏览器拦截


跨域资源共享（ CORS ）机制允许 Web 应用服务器进行跨域访问控制，从而使跨域数据传输得以安全进行。浏览器支持在 API 容器中（例如 XMLHttpRequest 或 Fetch ）使用 CORS，以降低跨域 HTTP 请求所带来的风险。


跨域需要遵循跨域资源共享标准（ cross-origin sharing standard ），该标准只允许在下列场景中使用跨域 HTTP 请求：
* 前文提到的由 XMLHttpRequest 或 Fetch 发起的跨域 HTTP * 请求。
* Web 字体 (CSS 中通过 @font-face 使用跨域字体资源), 因此，网站就可以发布 TrueType 字体资源，并只允许已授权网站进行跨站调用。
* WebGL 贴图
* 使用 drawImage 将 Images/video 画面绘制到 canvas
样式表（使用 CSSOM）
* Scripts (未处理的异常)



#### 参照MDN 给的三个例子来介绍跨域资源共享机制的工作原理

* 简单请求
* 预检请求
* 附带身份凭证的请求


###### 简单请求

某些请求不会触发 CORS 预检请求，即不会再请求前发送Options 请求。

简单请求需要满足的条件

使用下列方法之一：
* GET
HEAD
POST

* Fetch 规范定义了对 CORS 安全的首部字段集合，不得人为设置该集合之外的其他首部字段。该集合为：
Accept
Accept-Language
Content-Language
Content-Type （需要注意额外的限制）
DPR
Downlink
Save-Data
Viewport-Width
Width
* Content-Type 的值仅限于下列三者之一：
text/plain
multipart/form-data
application/x-www-form-urlencoded

简单请求的报文

```
// 请求首部
GET /resources/public-data/ HTTP/1.1
Host: bar.other
User-Agent: Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10.5; en-US; rv:1.9.1b3pre) Gecko/20081130 Minefield/3.1b3pre
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8
Accept-Language: en-us,en;q=0.5
Accept-Encoding: gzip,deflate
Accept-Charset: ISO-8859-1,utf-8;q=0.7,*;q=0.7
Connection: keep-alive
Referer: http://foo.example/examples/access-control/simpleXSInvocation.html
Origin: http://foo.example


// 响应信息
HTTP/1.1 200 OK
Date: Mon, 01 Dec 2008 00:23:53 GMT
Server: Apache/2.0.61 
Access-Control-Allow-Origin: *
Keep-Alive: timeout=2, max=100
Connection: Keep-Alive
Transfer-Encoding: chunked
Content-Type: application/xml

[XML Data]

```

1-10行是请求首部，Origin: http://foo.example 表示该请求来源于http://foo.example

响应中 Access-Control-Allow-Origin ： * 表示 该资源可以被任意外域访问

如果服务端仅允许来自 http://foo.example 的访问,则返回内容为：
`Access-Control-Allow-Origin: http://foo.example`



###### 预检请求

需预检的请求”要求必须首先使用 OPTIONS   方法发起一个预检请求到服务器，以获知服务器是否允许该实际请求

预检请求的条件

* 使用了下面任一 HTTP 方法：
PUT
DELETE
CONNECT
OPTIONS
TRACE
PATCH

* 人为设置了对 CORS 安全的首部字段集合之外的其他首部字段。该集合为：
Accept
Accept-Language
Content-Language
Content-Type (but note the additional requirements below)
DPR
Downlink
Save-Data
Viewport-Width
Width

* Content-Type 的值不属于下列之一:
application/x-www-form-urlencoded
multipart/form-data
text/plain

我们现在执行一个ajax 请求
```
var invocation = new XMLHttpRequest();
var url = 'http://bar.other/resources/post-here/';
var body = '<?xml version="1.0"?><person><name>Arun</name></person>';
    
function callOtherDomain(){
  if(invocation)
    {
      invocation.open('POST', url, true);
      invocation.setRequestHeader('X-PINGOTHER', 'pingpong');
      invocation.setRequestHeader('Content-Type', 'application/xml');
      invocation.onreadystatechange = handler;
      invocation.send(body); 
    }
}

```
该请求  Content-Type 为 application/xml ， 且为post请求，属于预检请求范畴，所以在请求之前会先发送options请求。

options 请求报文为

```
// 请求报文
OPTIONS /resources/post-here/ HTTP/1.1
Host: bar.other
User-Agent: Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10.5; en-US; rv:1.9.1b3pre) Gecko/20081130 Minefield/3.1b3pre
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8
Accept-Language: en-us,en;q=0.5
Accept-Encoding: gzip,deflate
Accept-Charset: ISO-8859-1,utf-8;q=0.7,*;q=0.7
Connection: keep-alive
Origin: http://foo.example
Access-Control-Request-Method: POST
Access-Control-Request-Headers: X-PINGOTHER, Content-Type


// 响应报文
HTTP/1.1 200 OK
Date: Mon, 01 Dec 2008 01:15:39 GMT
Server: Apache/2.0.61 (Unix)
Access-Control-Allow-Origin: http://foo.example
Access-Control-Allow-Methods: POST, GET, OPTIONS
Access-Control-Allow-Headers: X-PINGOTHER, Content-Type
Access-Control-Max-Age: 86400
Vary: Accept-Encoding, Origin
Content-Encoding: gzip
Content-Length: 0
Keep-Alive: timeout=2, max=100
Connection: Keep-Alive
Content-Type: text/plain

```

 OPTIONS 是 HTTP/1.1 协议中定义的方法，用以从服务器获取更多信息。该方法不会对服务器资源产生影响。 预检请求中同时携带了下面两个首部字段
 
 重点看
 
 ```
Access-Control-Request-Method: POST
Access-Control-Request-Headers: X-PINGOTHER

 ```
 
 首部字段 Access-Control-Request-Method 告知服务器，实际请求将使用 POST 方法。首部字段 Access-Control-Request-Headers 告知服务器，实际请求将携带两个自定义请求首部字段：X-PINGOTHER 与 Content-Type。服务器据此决定，该实际请求是否被允许。
 
 服务器收到后返回响应
 
 
`Access-Control-Allow-Methods: POST, GET, OPTIONS`
 该响应字段表明服务器允许 POST, GET, OPTIONS 方法发起请求
 
 
 `Access-Control-Allow-Headers: X-PINGOTHER, Content-Type` 该响应字段表明允许含有X-PINGOTHER, Content-Type 字段
 
 `Access-Control-Max-Age: 86400  `字段表示该响应的有效时间为 86400 秒，也就是 24 小时。在有效时间内，浏览器无须为同一请求再次发起预检请求
 
 
 当上述报文匹配成功才会发送真正的请求到服务器
 
 ##### 附带身份凭证的请求
 
 Fetch 与 CORS 的一个有趣的特性是，可以基于  HTTP cookies 和 HTTP 认证信息发送身份凭证。一般而言，对于跨域 XMLHttpRequest 或 Fetch 请求，浏览器不会发送身份凭证信息
 
 如果要发送cookies 等身份凭证信息， 需要设置
 
 `withCredentials = true` 
 
 此时查看请求响应是否有
 `Access-Control-Allow-Credentials: true `
 如果Access-Control-Allow-Credentials 不为true ,则表示服务器不允许发送身份凭证，且响应内容不会返回给请求的发起者。
 
 对于附带身份凭证的请求，服务器不得设置 Access-Control-Allow-Origin 的值为“*”。

这是因为请求的首部中携带了 Cookie 信息，如果 Access-Control-Allow-Origin 的值为“*”，请求将会失败。而将 Access-Control-Allow-Origin 的值设置为 http://foo.example，则请求将成功执行。

笔记参考资料:

* [ MDN ](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Access_control_CORS)
