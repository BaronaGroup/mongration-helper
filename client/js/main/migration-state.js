const React = require('react')

module.exports = class MigrationState extends React.Component {

  render() {

    const strings = {
      none: '',
      running: '...',
      success: '✓',
      failure: '✗'
    }

    const that = this
    return <span>{strings[this.props.state]}</span>

  }

}