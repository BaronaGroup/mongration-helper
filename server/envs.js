const _ = require('lodash'),
  authDBAuthProvider = require('../barona-js/auth-manager/auth-providers/auth-db-auth'),
  baronaSsoProvider = require('../barona-js/auth-manager/auth-providers/baronasso'),
  noAuth = require('../barona-js/auth-manager/auth-providers/test-no-auth'),
  UserDB = require('../barona-js/user-db/user-db')

const defaults = {
  dev: false,
  browserifyPrebuild: true,
  test: false,
  port: 3800,
  supportedLanguages: ['en']
}

const devBase = () => [
  new UserDB().glob(__dirname + '/../data/auth/dev/*.json'),
  {
    dev: true
  }]

const testBase = () => [
  new UserDB().glob(__dirname + '/../data/auth/test/*.json'),
  {
    test: true,
    authProvider: noAuth()
  }]

const envs = {
  development: userDB => [
    devBase, {
      authProvider: authDBAuthProvider(userDB, 'login')
    }],

  'login-barona-dev': () => [
    devBase, {
      authProvider: baronaSsoProvider('http://login.barona.dev:8081')
    }],

  'node-test': () => [
    testBase, {
      browserifyPrebuild: false,
      port: 3802
    }],

  'browser-test': () => [
    testBase, {
      port: 3801
    }],

  'selenium-test': () => [
    testBase, {
      port: 3803
    }]
}

exports.select = function() {
  const envName = process.env.NODE_ENV || 'development'
  const envGenerator = envs[envName]
  if (!envGenerator) throw new Error(`No environment ${envName}`)
  const userDB = new UserDB().glob(__dirname + '/../data/auth/universal/*.json')
  const env = _.extend({}, defaults, instantiateEnv(envGenerator, userDB))
  userDB.seal()
  env.userDB = userDB
  env.name = envName
  return env
}

function instantiateEnv(envGenerator, userDB) {
  const envDecl = _.isFunction(envGenerator) ? envGenerator(userDB) : envGenerator
  if (!_.isArray(envDecl)) {
    if (envDecl instanceof UserDB) {
      userDB.mergeFrom(envDecl)
      return {}
    } else {
      return envDecl
    }
  } else {
    return _.extend({}, ...envDecl.map(singleEnvDecl => instantiateEnv(singleEnvDecl, userDB)))
  }
}