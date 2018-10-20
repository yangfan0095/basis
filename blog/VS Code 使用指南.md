## 前言 
最近团队为了保持较好的前端开发规范，鼓励大家使用同一款编辑器，我们选择了vscode, 因为团队大部分人都在用，而且用起来很爽。为了让没有用vscode的同学快速了解它，我收集了网上一些资料加上自己的一点日常使用经验写了这篇介绍文章。
## vscode 使用介绍

Visual Studio Code （简称 VS Code）是由微软研发的一款免费、开源的跨平台文本（代码）编辑器。

我们将从一下几个部分来认识vscode
* 基本配置
* 集成
* 版本控制
* 代码调试

### 1 基本配置
* 直接官网下载 https://code.visualstudio.com/
* 首选项 ， 如下图，通过首选项，我们可以设置vscode 的基本配置 以及快捷键、用户自定义主题等。
![](https://user-gold-cdn.xitu.io/2018/10/18/16686e4e6b95d5dc?w=1714&h=714&f=png&s=213604)

如下图，基本配置实际上是一个json文件，里面有自带的默认配置，除此之外，我们每安装一个插件，都会生成一个新的json,我们通过在右侧输入自定义的json配置，就可以覆盖默认的配置项

![](https://user-gold-cdn.xitu.io/2018/10/18/16686ef79199acfe?w=2486&h=1804&f=png&s=825714)

* 快捷键 ，点击首选项下的快捷键可以查看和修改所有的快捷键配置
![](https://user-gold-cdn.xitu.io/2018/10/18/16686f1bc67d054b?w=2326&h=1848&f=png&s=500676)
...

### 2 集成
vscode 集成了大量第三方插件，通过第三方插件可以大大提高我们的开发效率

![](https://user-gold-cdn.xitu.io/2018/10/18/16686eae22f7a7b8?w=884&h=1364&f=png&s=294005)

常用插件推荐
* vuetr vue 格式化插件
* vscode-fileheader 自动保存文件创建人及修改人
* Auto Close Tag 自动关闭html标签
* Dark Dark - 猫哥基于默认 Dark 主题修改的增强主题
* EditorConfig for VS Code - 用于支持 .editorconfig 配置规范
* ESLint - 用于支持 JavaScript 实时语法校验
* Git History - 可查看文件的 git log 并进行对比
* HTML Snippets - 能修复默认 HTML Emmet 的一些问题
* Material Icon Theme - 左侧文件导航栏 Icon 主题
* Settings Syncs - 用于同步 VS Code 的配置到个人 gist 仓库

[更多插件支持 可以看这篇文章 《强大的 VS Code》 https://juejin.im/post/5b123ace6fb9a01e6f560a4b](https://juejin.im/post/5b123ace6fb9a01e6f560a4b)

就列这么多 大家可以自己摸索...

### 3 版本控制
vscode 集成了git 
切换至 Git 面板，点击左侧被修改的文件，即可进行版本对比。
![](https://user-gold-cdn.xitu.io/2018/10/18/1668701eada136ae?w=3350&h=1286&f=png&s=350600)


### 4 代码调试
Visual Studio Code 的关键特性之一就是它对调试的支持。在调试中如同chrome 浏览器的debug 一样，对于前端来说，能够非常方便进行nodeJS 代码调试 ,同时调试支持替他语言，

![](https://user-gold-cdn.xitu.io/2018/10/18/16686f7aec5e3034?w=1560&h=862&f=png&s=331175)

我们可以安装插件支持如python 等语言的调试

![](https://user-gold-cdn.xitu.io/2018/10/18/166870686193f3e8?w=1562&h=482&f=png&s=116578)



更多信息 参考官网[https://code.visualstudio.com/docs/editor/debugging](https://code.visualstudio.com/docs/editor/debugging)


#### 调试配置文件 launch.json
如果我们默认通过vscode 来调试代码，会生成一个launch.json 配置文件， 详细细节可以查看官方文档[https://code.visualstudio.com/docs/editor/debugging#_compound-launch-configurations](https://code.visualstudio.com/docs/editor/debugging#_compound-launch-configurations) 我们这里只说说我们一般会常用的地方。

#### lunch.json 配置项
* 必选字段
```
type：调试器类型。这里是 node(内置的调试器)，如果装了 Go 和 PHP 的扩展后对应的 type 分别为 go 和 php
request：请求的类型，目前只支持 launch 和 attach。launch 就是以 debug 模式启动调试，attach 就是附加到已经启动的进程开启 debug 模式并调试，跟上一篇提到的用 node -e "process._debugProcess(PID)" 作用一样
name：下拉菜单显示的名字
```
* 可选字段
```
program：可执行文件或者调试器要运行的文件 (launch)
args：要传递给调试程序的参数 (launch)
env：环境变量 (launch)
cwd：当前执行目录 (launch)
address：ip 地址 (launch & attach)
port：端口号 (launch & attach)
skipFiles：想要忽略的文件，数组类型 (launch & attach)
processId：进程 PID (attach)

```
同时目录变量有
```
${workspaceRoot}：当前打开工程的路径
${file}：当前打开文件的路径
${fileBasename}：当前打开文件的名字，包含后缀名
${fileDirname}：当前打开文件所在的文件夹的路径
${fileExtname}：当前打开文件的后缀名
${cwd}：当前执行目录
```

通常一个默认的launch.json 默认配置如下

```
{
    "version": "0.2.1",
    "configurations": [
        {
            "type": "node",
            "request": "launch",
            "name": "启动程序",
            "program": "${workspaceFolder}/index.js"
        }
    ]
}

```
这个配置会直接运行index.js 我们项目目录下的index.js 文件。

####  调试技巧

* ##### 条件断点

1 表达式：当表达式计算结果为 true 时中断 ,如这里可以判断 ctx.body.aaa = '1' ,当为满足这个条件时，才会断点
![](https://user-gold-cdn.xitu.io/2018/10/20/166908cb402fbbd9?w=872&h=536&f=png&s=121819)
2 命中次数
同样当表达式计算结果为 true进入断点，支持运算符 <, <=, ==, >, >=, %。
![](https://user-gold-cdn.xitu.io/2018/10/20/166908ea7bba0a4b?w=974&h=358&f=png&s=88785)

🙂
![](https://user-gold-cdn.xitu.io/2018/10/20/16690900ef6afd09?w=860&h=280&f=png&s=58983)


* ##### skipFiles  在调试时文件要跳过的一组 glob 模式
我们在单步调试时一般会进入到node_modules目录，但是我们一般往往只想调试我们的项目代码，所以这个时候可以通过配置 skipFiles 来进行过滤
详细官方文档参考[https://code.visualstudio.com/docs/nodejs/nodejs-debugging#_skipping-uninteresting-code-node-chrome](https://code.visualstudio.com/docs/nodejs/nodejs-debugging#_skipping-uninteresting-code-node-chrome)
```
  "skipFiles": [
    "${workspaceFolder}/node_modules/**/*.js",
    "${workspaceFolder}/lib/**/*.js"
  ]
  
  "skipFiles": [
     "<node_internals>/**/*.js"
   ]

```
* ##### 自动重启

通过添加配置可以实现修改代码保存后会自动重启调试，需要结合 nodemon 一起使用。
首先安装nodemon 

` npm i nodemon -g`


```
{
    "version": "0.2.1",
    "configurations": [
        {
            "type": "node",
            "request": "launch",
            "name": "debug-app",
            "runtimeExecutable": "nodemon",  要使用的运行时。一个绝对路径或路径上可用的运行时名称。如果省略，则假定为“节点”。
            "program": "${workspaceRoot}/app.js",
            "restart": true,
            "console": "integratedTerminal",
            "skipFiles": [
                "${workspaceRoot}/node_modules/**/*.js",
                "<node_internals>/**/*.js"
            ]
        }
    ]
}
```

参数说明
* runtimeExecutable：用什么命令执行 app.js，这里设置为 nodemon，默认是 node
* restart：设置为 true，修改代码保存后会自动重启调试
* console：当点击停止按钮或者修改代码保存后自动重启调试，而 nodemon 是仍然在运行的，通过设置为 console 为 integratedTerminal 可以解决这个问题。此时 VS Code 终端将会打印 nodemon 的 log，可以在终端右侧下拉菜单选择返回第一个终端，然后运行 curl localhost:3000 调试


#### 总结
以上差不多就是我们能够常用到的vscode 的地方，我个人觉得在使用过程中好的地方主要是两点即 
1、第三方插件的使用可以极大地丰富我们的使用功能 2、调试功能用起来真的很爽。 vscode是一个十分强大的IDE工具以上列出来的只是冰山一角之一角。有兴趣的可以直接看文档[https://code.visualstudio.com/docs](https://code.visualstudio.com/docs)，可以发掘出更多有意思的东西。




#### 本文主要参考了（但不限于）以下文章,感谢他们的贡献！

[vscode 官方文档](https://code.visualstudio.com/docs)

[Visual Studio Code 前端调试不完全指南](http://jerryzou.com/posts/vscode-debug-guide/)

[Node.js 性能调优之调试篇(二)——Visual Studio Code](https://www.ctolib.com/topics-124092.html)

[使用vscode调试编译后的js代码](https://meixg.cn/2018/05/13/2018/vscode-debug/)



以上


