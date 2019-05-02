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
