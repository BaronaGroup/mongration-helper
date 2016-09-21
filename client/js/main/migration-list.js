const React = require('react'),
  Loading = require('../general/loading'),
  axiosRetry = require('../axios-retry'),
  Migration = require('./migration'),
  _ = require('lodash'),
  MigrationActions = require('./migration-actions')

module.exports = class MigrationList extends React.Component {
  constructor() {
    super()
    this.state = {migrations: undefined}
  }

  componentWillMount() {
    this.reload()
  }

  async reload() {
    const migrations = (await axiosRetry({url: '/api/migrations'})).data
    if (!this.state.migrations) {
      this.setState({checkedMigrations: migrations})
    }
    this.setState({migrations})
  }

  render() {
    const that = this
    if (!this.state.migrations) {
      return <Loading />
    } else {
      return (
        <div>
          <button className="create-new" onClick={createNew}>Create new</button>
          <ol>
            {this.state.migrations.map(migration =>
              <li key={migration}>
                <Migration checked={isChecked(migration)} updateChecked={updateChecked} migration={migration}/>
              </li>)}
          </ol>
          <MigrationActions />
        </div>
      )
    }

    function isChecked(migration) {
      return that.state.checkedMigrations.includes(migration)
    }

    function updateChecked(migration, state) {
      if (state) {
        that.setState({checkedMigrations: that.state.checkedMigrations.concat([migration])})
      } else {
        that.setState({checkedMigrations: _.without(that.state.checkedMigrations, migration)})
      }
    }

    async function createNew() {
      const name = window.prompt('Enter migration name')
      if (name) {
        await axiosRetry({url: '/api/migration', method: 'POST', data: {name}})
        that.reload()
      }
    }
  }
}