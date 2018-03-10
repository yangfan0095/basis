## css 弹性布局
##### 浮动布局存在的问题
* 难以控制
* html代码顺序依赖
* 列等高问题
* 内容居中

##### 针对以上问题，弹性盒子处理的方式
* 通过将弹性元素拉伸或缩小来充满可用空间和避免溢出。这种方式解决了新内容的溢出问题并且以开发者期望的情况实施布局。
* 给予弹性元素成比例的尺寸
* 弹性容器内的弹性元素可以从任意方向布局。可以解决在不同媒体查询中元素的顺序问题。使得可见内容的顺序独立于HTML渲染顺序，有利于站点的响应式设计。

[网格布局方法MDN](https://developer.mozilla.org/zh-CN/docs/Web/CSS/CSS_Grid_Layout/Relationship_of_Grid_Layout#Grid_and_absolutely_positioned_elements)

[flex 属性](http://zhoon.github.io/css3/2014/08/23/flex.html)
* flex-grow  分配剩余空间
* flex-basics 类似于width ，分配空间之前 预定空间
* flex-shrink 空间比内容小，需要空间压缩，配置各个子项压缩比例


## css 网格布局
CSS网格布局和弹性盒布局的主要区别在于弹性盒布局是为一维布局服务的（沿横向或纵向的），而网格布局是为二维布局服务的（同时沿着横向和纵向）。这两个规格有一些相同的特性。
代码示例
```
  <style>
        .wrapper {
            display: grid;
            border: 2px solid #f76707;
            border-radius: 5px;
            background-color: #fff4e6;
            grid-template-columns: repeat(3, 1fr);
            grid-auto-rows: 200px;
            grid-column-gap: 10px;
            grid-row-gap: 1em;
        }

        .wrapper>div {
            border: 2px solid #ffa94d;
            border-radius: 5px;
            background-color: #ffd8a8;
        }

        .wrapper .box1 {
            grid-column-start: 1;
            grid-column-end: 4;
        }

        .wrapper .box2 {
            grid-column-start: 1;
            grid-row-start: 2;
            grid-row-end: 4;
        }
    </style>

</head>

<body>
    <div class="gird">
        <div class="wrapper">
            <div class="box1">One</div>
            <div class="box2">Two</div>
            <div>Three</div>
            <div>Four</div>
            <div>Five</div>
        </div>
    </div>
</body>

```
