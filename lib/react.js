import RenderDOM from './react-dom.js';

/**
 * @param {String} tag 标签名
 * @param {Object} attrs 各个属性
 * @param {Sting | Object} children 子元素(element对象 或 字符串)
 *
 * @return {Object} element对象
 * */
function createElement(tag, attrs, ...children) {
    return {
        tag,
        attrs,
        children
    };
}

class Component {
    constructor(props = {}) {
        this.props = props;
        this.state = {};
    }

    setState(stateChange) {
        Object.assign(this.state, stateChange);
        RenderDOM.renderComponent(this);
    }
}

const React = {
    createElement,
    Component
};

export default React;
