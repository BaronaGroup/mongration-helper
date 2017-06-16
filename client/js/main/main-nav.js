const React = require('react'),
  { Link } = require('react-router'),
  items = require('./items.json'),
  Counter = require('./counter'),
  Greeting = require('./greeting')

const NavItem = React.createClass({
  propTypes: {
    item: React.PropTypes.object.isRequired
  },
  render() {
    return <div>
      <Link to={`/item/${this.props.item.id}`} activeClass='selected'>{this.props.item.label}</Link>
    </div>
  }
})

module.exports = React.createClass({
  propTypes: {
    children: React.PropTypes.element.isRequired
  },
  getInitialState() {
    return {
      items,
      buttonLabel: 'Test AJAX retry'
    }
  },
  render() {
    return <div>
      <button onClick={this.logout}>Log out</button> <button onClick={this.sometimesFailsSometimesNot}>{this.state.buttonLabel}</button>
      <table>
        <tbody>
        <tr>
          <td>
            {this.state.items.map(item => <NavItem key={item.id} item={item}/>)}
          </td>
          <td>
            <Counter />
            {this.props.children}
          </td>
        </tr>
        </tbody>
      </table>
    </div>
  },
  async logout() {
    await fetch('/api/session/logout', {method: 'POST', credentials: 'same-origin'})
    document.location.href = '/'
  },
  sometimesFailsSometimesNot() {
    require('../axios-retry')({
      url: '/api/system/fail-sometimes',
      custom: {
        retry: true
      }
    })
      .then(response => {
        this.setState({buttonLabel: response.data.text})
      })
  }
})

module.exports.Dashboard = React.createClass({
  render() {
    return <div>No selection. <Greeting name={{first: 'Bob'}}/></div>
  }
})