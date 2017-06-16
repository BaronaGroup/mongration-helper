if (!/build^/.test(__dirname)) {
  require('babel-register')
  require('babel-polyfill')
}
const P = require('bluebird')
P.promisifyAll(require('request'))
P.promisifyAll(require('express-session'))
P.promisifyAll(require('fs'))