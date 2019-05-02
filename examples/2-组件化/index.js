import React from '../../lib/react.js';
import ReactDOM from '../../lib/react-dom.js';

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
