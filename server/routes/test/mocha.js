const express = require('express')

exports.configure = function(app, env, shared) {
  app.use('/test/vendor/mocha', express.static(__dirname + '/../../../node_modules/mocha'))
}
