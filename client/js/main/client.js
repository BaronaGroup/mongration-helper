const React = require('react'),
  SettingsDisplay = require('./settings-display'),
  MigrationList = require('./migration-list'),
  ErrorContainer = require('./errors').ErrorContainer,
  Log = require('./stream-req').Log

module.exports = class Client extends React.Component {
  render() {
    return <div>
      <ErrorContainer />
      <SettingsDisplay />
      <MigrationList />
      <Log />
    </div>
  }
}