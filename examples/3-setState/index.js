import React from '../../lib/react.js';
import ReactDOM from '../../lib/react-dom.js';

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
                {onClick: () => {this.setState({ number: this.state.number + 1 });}},
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
