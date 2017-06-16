const React = require('react'),
  items = require('./items.json'),
  _ = require('lodash'),
  {Link} = require('react-router')

module.exports = React.createClass({
  propTypes: {
    params: React.PropTypes.object.isRequired,
    children: React.PropTypes.element
  },
  render() {
    const item = _.find(items, {id: this.props.params.itemid})
    return <div>
      <h1>{item.label}</h1>
      <ul>
      </ul>
      {item.children.map(child => <li key={child}><Link to={`/item/${this.props.params.itemid}/${child}`}>{child}</Link></li>)}
      {this.props.children}
    </div>
  }
})

module.exports.SubItem = React.createClass({
  propTypes: {
      params: React.PropTypes.object.isRequired
    },
    render() {
      return <div>
        <h2>{this.props.params.subid}</h2>
      </div>
    }
})