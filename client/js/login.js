require('./configure-browser')

const React = require('react'),
  ReactDOM = require('react-dom'),
  LoginPage = require('./login/login-page')

document.addEventListener('DOMContentLoaded', function() {
  const [, error] = document.location.search.match(/[^&]loginError=(.+?)($|&)/) || []
  ReactDOM.render(<LoginPage error={error} />, document.querySelector('#app'))
})