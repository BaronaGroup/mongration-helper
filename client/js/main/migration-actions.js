const React = require('react'),
  axios = require('axios')

module.exports = class MigrationActions extends React.Component {

  render() {
    const getChecked = this.props.getChecked
    return <div>
      <button onClick={commit} className="commit">Commit checked</button>
    </div>

    async function commit() {
      if (!window.confirm('Are you sure?')) return
      await axios.post('/api/migrations/commit', {migrations: getChecked()})
      alert('Committed!')
      document.location.reload()
    }
  }
}