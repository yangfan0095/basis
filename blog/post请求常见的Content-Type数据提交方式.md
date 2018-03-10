http 协议是以ASCII码传输建立在TCP/IP 协议上的应用规范。规范把Http请求设定为三个部分分别是

* 状态行
* 请求头
* 消息主体

协议规定POSTt提交的数据必须放在消息主体中，但是并没有限定提交数据使用的编码方式。

post 请求常见四种数据提交方式

* application/x-www-form-urlencoded 最主流的post提交数据方式,将请求参数进行key=value&key2=value2xxx的形式进行传递。我们使用jQuery 封装的Ajax传输 默认的请求类型就是application/x-www-form-urlencoded。

```
POST http://www.example.com HTTP/1.1
Content-Type: application/x-www-form-urlencoded;charset=utf-8

title=test&sub%5B%5D=1&sub%5B%5D=2&sub%5B%5D=3

```
* multipart/form-data 当我们使用表单上传文件，必须让表单的enctype 为multipart/form-data。该方法将文件以二进制的形式上传。首先会生成一个 boundary 用于分割字段。


上述这两种数据提交方式各大浏览器都原生支持。

* application/json  当我们需要传递更复杂的数据类型的时候，显然key value这种方式不能很好地满足我们的需求。 同时由于JSON规范的流行，除了低版本的IE浏览器以外，各大浏览器都原生支持 JSON.stringify ，服务端也是如此。
传参示例
```
POST http://www.example.com HTTP/1.1 
Content-Type: application/json;charset=utf-8

{"title":"test","sub":[1,2,3]}

```

* text/xml
这是使用xml作为规范的数据提交方式。

本文参考资料

[资料1](https://imququ.com/post/four-ways-to-post-data-in-http.html)
