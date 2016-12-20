# meng

一个声明式的数据源管理库

## 安装

```js
npm i meng --save
```

## 灵感

总所周知，react是一个侧重同步数据到dom的库，也就是`(data) => dom`. 这里的data包含了`props`和`state`，但是其他的数据源不好管理，比如说api。
而现有的方案用起来都太复杂了，本来`(data) => dom`一个函数能解决的问题，用了flux架构比如redux之后，需要的模块*3。所以能不能用一种简单的方式把所有数据源都抽象成`data`，
并且能用react的方式解决问题呢，答案是肯定的，我们可以这么设计`({props, state, api}) => dom`。于是就有了meng--一个把所有数据源都抽象合并成一种数据类型的库。

## api

### Store

每一个meng组件都有自己的store，store的结构是这样的：

```js
interface Store<S> {
    state$: ReplaySubject<S> // store的触发器
    store$: Observable<S> // store的状态容器
    children: { [key: string]: Store<Object> } //存放子store，因为是扁平结构，所以只有根store的children才有子节点
    setState: Function, // 设置store$的状态
    subscribe: (success: (state: Object) => void, error?: (error: Error) => void, complete?: () => void) => Subscription // 订阅store$
}
```

所有的meng组件的状态又都会放在根节点的children里面，所以meng支持直接修改和订阅另一个组件的状态，下面是一段demo:

```js
import Store from 'meng'

Store.children.App.setState({user: {}})
```

### lift: (initialState, initialName) => React.Component

lift函数可以把react组件提升为meng组件，他只有两个参数：

+ `initialState` 初始化meng组件的状态
+ `initialName` 设置store的名字，如果不显式的设置，则默认使用displayName、函数名称、随机一个名字，按优先级排序。

### inject: (resource, selector) => React.Component

+ `resource` 给组件注入数据源，可以是promise，也可以是其他组件的store，也可以是函数
+ `selector` 注入到react组件的props的变量的名称，可以是stirng也可以是返回一个对象(会覆盖store里的其他状态)

## Example

展示一段我用meng写的项目的代码吧:

```js
import * as React from 'react'
import { lift, resource } from 'meng'
import Logo from '../common/banner/banner'
import Preview from './preview/preview'
import DetailText from './text/text'
import Like from './like/like'
import Menu from './menu/menu'
import Margin16 from '../common/margin16/margin16'

import { getById, getByCollocation } from '../../api/commodity.api'

@inject(props => getById(props.params.cid), "data")
@inject(props => (window.scrollTo(0, 0), getByCollocation()), "cos")
@lift({ data: {}, cos: [] })
export default class Detail extends React.Component<any, any> {
  render() {
    return (
      <div>
        <Logo width={document.body.clientWidth} />
        <Preview data={this.props.data} />
        <Margin16 />
        <DetailText data={this.props.data.detail} />
        <Margin16 />
        <Like data={this.props.cos} />
        <Menu data={this.props.data} />
      </div>
    )
  }
}
```

## 使用上的建议

因为meng是管理数据源为主，夸组件通讯为辅的。你可以像redux那样直接注入数据源，但是应该尽量避免让组件从其他地方获取数据，原则上组件获取数据的方式只有一个，就是父组件，
所有的数据源都应该从视图开始注入，然后传到下面的子组件，这是符合依赖倒置原则的。上面的示例就是一个正确的用法。

## 其他

不需要初始化，不需要配置，不需要`import redux-xxx * N`，赶快试试吧。如果有好的建议，请发我邮箱: akira.binjie@gmail.com