## 虚拟树
js 对象

```
{
    tag: "div",
    attrs: null,
    children: [
        "hello",
        {
            tag: "span",
            attrs: null,
            children: [
                "world"
            ]
        }
    ]
}
```
可以用来表示 html 结构
```
<div>
    hello<span>world!</span>
</div>
```
上面的 js 对象既可称为虚拟树

## jsx 本质

```
<div>
    hello<span>world!</span>
</div>
```   
被 babel 编译后，结果是
```
React.createElement(
    'div',
    null,
    'hello',
    React.createElement(
        'span',
        null,
        'world!'
    )
)
```

执行结果是返回上面的 js 对象 (虚拟树)，那么 createElement 方法就是

```
function createElement(tag, attrs, ...children) {
    return {
        tag,
        attrs,
        children
    };
}
```

## 把虚拟树转换成 dom

```
/**
 * @param {Object} element 虚拟树对象
 * @param {Object} rootDom 被挂载目标的真实 dom 节点
 * */
function render(element, rootDom) {

    // element 只是字符串
    if (typeof element === 'string') {
        const textNode = document.createTextNode(element);
        return rootDom.appendChild(textNode);
    }

    const dom = document.createElement(element.tag);

    // 设置属性
    if (element.attrs) {
        Object.keys(element.attrs).forEach(key => {
            setAttribute(dom, key, element.attrs[key]); // 设置属性要区分各种情况，单独方法
        });
    }

    // 渲染 children
    element.children.forEach(child => render(child, dom)); // 递归出去调用 render

    return rootDom.appendChild(dom); // 递归回来的 dom 会被 append 到前一个 dom 上, 最后一起被 append 到 rootDom 上
}

/**
 * @param {Object} dom 需要被添加属性的 dom 节点
 * @param {String} key 属性名
 * @param value 属性值
 *
 * @return void
 * */
function setAttribute(dom, key, value) {

    if (key === 'className') {
        // class
        dom.class = value;
    } else if (/^on\w+/.test(key)) {
        // 事件监听
        dom[key.toLocaleLowerCase()] = value;
    } else if (key === 'style') {
        // style
        if (typeof value === 'string') {
            // 值是 css 字符串
            dom.style.cssText = value;
        } else if (typeof value === 'object') {
            // 值是对象，挨个赋值
            Object.keys(value).forEach(cssKey => {
                // 可以通过style={ width: 20 }这种形式来设置样式，可以省略掉单位px
                const cssValue = value[cssKey];
                dom.style[cssKey] = typeof cssValue === 'number' ? `${cssValue}px` : cssValue;
            });
        }
    } else {
        // 其他
        dom.setAttribute(key, value);
    }
}
```

通过调用 render 方法，可以将虚拟树转换成 dom 对象，并挂载到一个根节点下，通过测试代码测试一下

```
import React from '../../lib/react.js';
import ReactDOM from '../../lib/react-dom.js';

const element = React.createElement(
    'div',
    {onClick: () => alert('hello')},
    'hello ',
    React.createElement(
        'span',
        {onClick: () => alert('world')},
        'world!'
    )
);

ReactDOM.render(element, document.getElementById('root'));
```

## Component 组件化

上面的实现还不能实现组件化，createElement 的第一个参数 tag 是一个真实的 html 的 tag, 引入 class Component, 可以作为 createElement 方法的第一个参数 tag。
Component 也需要一个 render 方法，作用是返回组件对应的虚拟树。
   
想要实现的效果是
```
class HelloWorld extends React.Component {
    render() {
        return(
            React.createElement(
                'div',
                null,
                React.createElement(
                    Text,
                    {text: 'Hello'},
                    null
                ),
                React.createElement(
                    Text,
                    {text: 'World'},
                    null
                ),
            )
        );
    }
}

class Text extends React.Component {
    render() {
        return(
            React.createElement(
                'div',
                null,
                this.props.text
            )
        );
    }
}

ReactDOM.render(
    React.createElement(HelloWorld, null, null)
    ,
    document.getElementById('root')
);
```

对应的 jsx 写法, render 方法中 return 的是

```
// HelloWorld 组件
<div>
    <Text text='Hello'/>
    <Text text='World'/>
</div>

// Text 组件
<div>{this.props.text}</div>
```

先实现一个 Component 基类

```
class Component {
    constructor(props = {}) {
        this.props = props;
    }
}
```

为了可以将 Component 转化成真实 dom，需要升级 ReactDOM.render 方法，添加 tag 是 Component 的情况

```
// element 是 React.Component
if (typeof element.tag === 'function') {
    // element.tag 是类名, element.attrs 是 props
    const component = (new element.tag(element.attrs)).render();
    // 上面返回的还是一个虚拟树, 继续调用 render 渲染
    return render(component, rootDom);
}
```

## 实现 setState

先修改 Component 基类

```
class Component {
    constructor(props = {}) {
        this.props = props;
        this.state = {};
    }

    setState(stateChange) {
        Object.assign(this.state, stateChange);  // 合并新 state 到旧 state
        RenderDOM.renderComponent(this);         // 刷新 component 对应的真实 dom
    }
}
```

这里先不考虑 diff，直接用新的 dom 替换掉旧的 dom，dom.parentNode.replaceChild(newDom, dom)   
   
为了实现 dom 的替换，需要先知道该 component 对应的 dom 是哪个，所以需要改造下 ReactDOM.render 方法

- 写一个 _render(element) 返回一个完整的 element 的真实 dom
- 写一个 renderComponent(component) 给 component 挂载一个它对应的真实 dom
- 首次渲染的时候先执行 renderComponent，给每个 component 都挂上自己对应的 dom
- setState 是也执行 renderComponent，先替换 dom，再给 component 挂载新的 dom

```
function renderComponent(component) {
    const newBase = _render(component.render());
    if (component.base && component.base.parentNode) {
        // 首次执行的时候没有 base, 在 setSate 的时候替换 dom
        component.base.parentNode.replaceChild(newBase, component.base);
    }
    component.base = newBase;
}

/**
 * @param {Object} element 虚拟树对象
 * @param {Object} rootDom 被挂载目标的真实 dom 节点
 * */
function render(element, rootDom) {
    return rootDom.appendChild(_render(element));
}

function _render(element) {

    // element 只是字符串
    if (typeof element === 'string' || typeof element === 'number') {
        return document.createTextNode(element.toString());
    }

    // React.Component
    if (typeof element.tag === 'function') {

        // element.tag 是类名, element.attrs 是 props
        const component = new element.tag(element.attrs);
        renderComponent(component);
        return component.base;
    }

    const dom = document.createElement(element.tag);

    // 设置属性
    if (element.attrs) {
        Object.keys(element.attrs).forEach(key => {
            setAttribute(dom, key, element.attrs[key]); // 设置属性要区分各种情况，单独方法
        });
    }

    // 渲染 children
    if (element.children) {
        element.children.forEach(child => render(child, dom)); // 递归出去调用 render
    }

    return dom;
}
```

用测试代码测试下效果，通过点击 `state.number++`

```
class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            number: props.number
        };
    }
    render() {
        return (
            React.createElement(
                'div',
                {onClick: () => {this.setState({ number: this.state.number + 1 })}},
                this.state.number
            )
        );
    }
}

ReactDOM.render(
    React.createElement(App, { number: 2 }, null)
    ,
    document.getElementById('root')
);
```
































