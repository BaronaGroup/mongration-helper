const React = require('react'),
  axios = require('axios')

module.exports = class MigrationActions extends React.Component {

  render() {
    const getChecked = this.props.getChecked
    return <div>
      <button onClick={commit} className="commit">Commit checked</button>
    </div>

    function commit() {
      if (!window.confirm('Are you sure?')) return
      axios.post('/migrations/commit', {migrations: getChecked()})
      alert('Committed!')
      document.location.reload()
    }
  }
}