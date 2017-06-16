const React = require('react'),
  T = require('../general/t')

module.exports = React.createClass({
  propTypes: {
    name: React.PropTypes.object
  },
  render() {
    return <div className="greeting">
      <span><T translation="greeting.text" data={{name: <b key="name">{this.props.name.first}</b>}} />
      <T translation="missing.translation" />
      </span>
    </div>
  }
})
