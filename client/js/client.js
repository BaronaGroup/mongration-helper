require('./configure-browser')

const React = require('react'),
  ReactDOM = require('react-dom'),
  globals = require('./globals'),
  Loading = require('./general/loading'),
  axiosRetry = require('./axios-retry'),
  Client = require('./main/client')


document.addEventListener('DOMContentLoaded', function() {
  ReactDOM.render(<Client />, document.querySelector('#app'))
})