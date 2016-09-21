const React = require('react'),
  Loading = require('../general/loading'),
  axiosRetry = require('../axios-retry'),
  _ = require('lodash')

module.exports = class SettingsDisplay extends React.Component {
  constructor() {
    super()
    this.state = {data: undefined}
  }

  async componentWillMount() {
    const config = (await axiosRetry({url: '/api/config'})).data
    this.setState({data: config})
  }

  render() {
    if (!this.state.data) {
      return <Loading />
    } else {
      const pairs = _.toPairs(this.state.data)
      return <ul>
        {pairs.map(([key, value]) => <li key={key}>{key}: {value}</li>)}
        </ul>
    }
  }
}