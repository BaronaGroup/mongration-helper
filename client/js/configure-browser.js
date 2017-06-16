require('babel-polyfill')
window.Promise = require('bluebird')
require('./main/errors').configureAjax()

