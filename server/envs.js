const _ = require('lodash')

const defaults = {
  dev: false,
  browserifyPrebuild: true,
  test: false,
  port: 4300,
  supportedLanguages: ['en']
}

const devBase = () => [
  {
    dev: true
  }]

const envs = {
  development: () => [devBase]
}

exports.select = function() {
  const envName = process.env.NODE_ENV || 'development'
  const envGenerator = envs[envName]
  if (!envGenerator) throw new Error(`No environment ${envName}`)
  const env = _.extend({}, defaults, instantiateEnv(envGenerator))
  env.name = envName
  return env
}

function instantiateEnv(envGenerator) {
  const envDecl = _.isFunction(envGenerator) ? envGenerator() : envGenerator
  if (!_.isArray(envDecl)) {
    return envDecl
  } else {
    return _.extend({}, ...envDecl.map(singleEnvDecl => instantiateEnv(singleEnvDecl)))
  }
}