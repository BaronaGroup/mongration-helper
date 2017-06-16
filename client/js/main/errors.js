const axios = require('axios'),
  _ = require('lodash'),
  React = require('react')

let activeErrorContainer,
  lastUsedErrorId = 0

exports.configureAjax = function() {
  axios.interceptors.response.use(_.identity, function(error) {
    if (!(error instanceof Error)) {
      if (error.status === 401) {
        document.location.reload()
      } else if (activeErrorContainer) {
        activeErrorContainer.addError(<AjaxError error={error}/>)
      }
    } else {
      activeErrorContainer.addError(<GenericError error={error}/>)
    }
    throw error
  })
}

exports.showError = error => {
  if (activeErrorContainer) {
    activeErrorContainer.addError(<GenericError error={error}/>)
  }
}

const AjaxError = React.createClass({
  propTypes: {
    error: React.PropTypes.object.isRequired
  },
  render() {
    return <div>{this.props.error.statusText || this.props.error.status}</div>
  }
})

const GenericError = React.createClass({
  propTypes: {
    error: React.PropTypes.object.isRequired
  },
  render() {
    return <div>{this.props.error.message}</div>
  }
})

exports.ErrorContainer = React.createClass({
  getInitialState() {
    return {
      errors: []
    }
  },
  componentDidMount() {
    activeErrorContainer = this
  },
  componentWillUnmount() {
    activeErrorContainer = null
  },
  render() {
    return <ul>
      { this.state.errors.map(error => <li key={error.key} onClick={() => this.removeError(error)}>{error.error}</li>) }
    </ul>
  },
  addError(rawError) {
    const error = {
      key: ++lastUsedErrorId,
      error: rawError
    }
    this.setState({errors: this.state.errors.concat([error])})
  },
  removeError(error) {
    this.setState({errors: _.without(this.state.errors, error)})
  }
})