const React = require('react'),
  T = require('../general/t')

module.exports = React.createClass({
  getInitialState() {
    return {counter: 0}
  },
  render() {
    return <div className="counter">
      <span className="counter-value"><T translation="counter" data={{count: this.state.counter}} /></span>
      <button onClick={e => this.setState({counter: this.state.counter + 1})}>Increment</button>
    </div>
  }
})
