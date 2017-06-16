"use strict"

const supportLib = require('../barona-js/browserify/browserify-support')

exports.configure = function(env) {
  const api = supportLib.configure({
    parsedLibraries: [
      'babel-polyfill',
      'react',
      'react-dom'
    ],
    noParseLibraries: [
      'lodash',
      'bluebird',
      'axios'
    ],
    transforms: [
      require('babelify'),
      require('require-globify')
    ],
    debug: !!env.dev
  })

  return {
    libs: api.configureLibraryRoute(!env.test && env.browserifyPrebuild),
    client: api.configureRoute(__dirname + '/../client/js/client.js', !env.test && env.browserifyPrebuild),
    login: api.configureRoute(__dirname + '/../client/js/login.js', !env.test && env.browserifyPrebuild),
    test: api.configureRoute(__dirname + '/../test/browser/browser-tests.js', !!env.test && env.browserifyPrebuild)
  }
}