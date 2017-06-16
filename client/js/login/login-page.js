const React = require('react')

module.exports = React.createClass({
  propTypes: {
    error: React.PropTypes.string
  },
  render() {
    return <form method="POST" action="/api/public/session/login">
      <h1>Please log in</h1>
      {this.props.error && <div className="error">Error: {this.props.error}</div>}
      <label>Username <input name="username" /></label>
      <label>Password <input name="password" type="password" /></label>
      <button>Log in</button>
    </form>
  }
})