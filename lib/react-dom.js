function renderComponent(component) {
    const newBase = _render(component.render());
    if (component.base && component.base.parentNode) {
        // 可用 base 判断是否首次渲染，首次渲染无 base
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

const ReactDOM = {
    render,
    renderComponent
};

export default ReactDOM;
