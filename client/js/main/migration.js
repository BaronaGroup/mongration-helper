const React = require('react'),
  MigrationState = require('./migration-state'),
  streamReq = require('./stream-req')

module.exports = class Migration extends React.Component {
  constructor() {
    super()
    this.state = {
      state: 'none'
    }
  }

  render() {
    const that = this
    return <div>
      <input type="checkbox" checked={this.props.checked}
             onChange={e => that.props.updateChecked(this.props.migration, e.target.checked)}/>
      {this.props.migration}
      <button onClick={run}>run</button>
      <button onClick={rollback}>rollback</button>
      <MigrationState state={this.state.state}/>
    </div>

    function run() {
      that.setState({state: 'running'})
      streamReq.stream('/api/migration/run/' + that.props.migration)
        .then(outcome => {
          that.setState({state: outcome.success ? 'success' : 'failure'})
        })
    }

    function rollback() {
      that.setState({state: 'running'})
      streamReq.stream('/api/migration/rollback/' + that.props.migration)
        .then(outcome => {
          that.setState({state: outcome.success ? 'success' : 'failure'})
        })
    }
  }
}