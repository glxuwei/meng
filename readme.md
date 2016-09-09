# meng

用过各种数据流库之后，是不是感觉有点烦，但是说不出为什么。其实就是他们的约束和规范太多了,加上各种各样的依赖,很容易产生`javascript fatigue`, 这时候反而很想直接使用react了。
数据就存在state里面好了，那么剩下一个问题就是组件之间怎么通讯，react原生的通讯方式(父级传回调)确实太恶心人了，不仅要传，还要层层传。那么meng就是为了解决这个问题的。

## 安装

    npm i meng --save

## Usage

```js
  import Store, { lift, resource } from 'meng'
  //组件的store可以互相注入，这里把根store注入进来，你可以把全局变量，比如用户登录之后的信息存在这里 Store.setState({user: userinfo})
  @resource(Store, "rootStore")
  //注入一个thunk, 接收props作为参数，并返回一个promise，组件mounted会调用一次，组件props每次发生改变的时候都会调用一次
  @resource(props => fetch(`/test/${props.params.tid}`), "field3")
  //注入一个thunk，没有参数，并返回一个promise，组件mounted会调用一次
  @resource(() => fetch("/test"), "field2")
  //也可以给组件注入任意值
  @resource("test", "field1")
  //初始化原生组件
  @lift({todos: []})
  //建议组件使用class写法，组件名字开头大写
  class App extends React.Component {
    state = Store["App"].state
    render() {
      const { field1, field2, field3, todos } = this.state
      return <div>
        <Child data={todos}/>
      </div>
    }
  }

  @lift({todo: "test"})
  class Child extends React.Component {
    render() {
      const { data } = this.props
      const { todo } = this.state
      return <div onClick={this.clickHandle}>{data}</div>
    }
    clickHandle = e => this.setState({todo: "clicked"})
  }
```
## Api

### lift(initialState)

把普通组件提升为meng组件的方法，只有一个参数，表示初始化组件状态
为了防止每次props把state里的相同属性覆盖，而导致没必要的修改props，我把state的优先级设定得比props高。
所以我建议的meng组件是无props传参的，只有`lift state`的组件，当然你也可以通过props传参，但是如果和state重复，会被state覆盖，请注意

### resource<T>(any|Observable|Promise|(props) => T , string|Function, [string|Function])

给组件注入数据源，只能给已经lift的组件使用
第一个参数可以接收任意值，也可以是rxjs的Observable,也可以是promise, 推荐使用rxjs的ajax方法处理接口或者fetch。为了将声明式数据源进行到底，在2.0里新增了一个类型Function，
在某些场合比如需要路由中的某个参数，这个时候组件还没有加载没有办法获取这个参数，则可以使用此方法，meng会在高阶组件Lift加载完之后，把props传给你的函数
> 当注入的thunk函数不接收参数的时候，这个函数只会在高阶组件willmounted调用一次
> 当注入的thunk函数接收参数的时候，这个函数不仅会在高阶组件willmounted调用一次，还会在props每次发生改变的时候都会调用一次，注意lift初始化的变量叫state不是props

第二个参数是当第一个参数成功注入的时候的回调，如果是字符串则表示作为变量注入到组件对应的Store里，如果是函数，则调用这个函数，并把组件对应的store和返回值传给函数  
第三个参数是第一个参数注入失败之后的回调，如果是字符串则表示作为变量注入到组件对应的Store里，如果是函数，则调用这个函数，并把组件对应的store和返回值传给函数

### Store

相当于ng的rootScope，那么你可能要问scope呢，对的，这里的每个使用lift提升过的组件都有自己的store，或者叫scope都行。
你可以直接使用`Store.组件名`来访问mounted的组件的状态。组件之间的通讯也是这么实现的，你可以`Store.组件名.setState()`直接修改另一个组件的状态！
每个store，包括根store都是`StoreConstructor`的实例，它包含以下属性:

+ `state` 每个store的状态都存在这个容器里面
+ `@@subject` 每个store的事件触发器，它是rxjs的Subject，不懂的可以忽略
+ `setState` 改变当前store的方法，它和react的setState方法一样，甚至包括回调。
+ `subscribe` 订阅这个store，调用setState会触发这个函数,用法: `Store.App.subscribe(state => localStorage.setItem("cache": JSON.stringify(this.state)))`

我改变了lifted组件的setState方法，所以如果你还在组件里`this.setState`，其实就相当于`Store.组件名.setState()`。那么你可能要说我如果要局部状态怎么办啊。
局部状态其实不符合我的思路的，包括redux都推荐用store取代state，如果是封闭状态的组件，你完全可以不lift嘛，如果lifted还矫情什么，一家老小都存store就对了。
如果你还是喜欢`this.state`，那么你可以直接把store绑定到你的state上。如果是stateless，你需要给stateless组件指定displayName。

## 设计思路

我的设计思路非常先进，基本是就是未来几年react架构的主要发展方向了。😂
具体请参考我的博客[关于react的数据流新思路](https://github.com/useroriented/useroriented.github.io/blob/master/coral/think-of-react-data-flow.md)
