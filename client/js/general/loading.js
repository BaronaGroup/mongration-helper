const React = require('react')

module.exports = React.createClass({
  propTypes: {
    name: React.PropTypes.object
  },
  render() {
    return <div className="loading-indicator">#</div>
  }
})
