exports.configure = (env, configureUnprotectedPaths) => {
  return {
    authManager: require('../barona-js/auth-manager/auth-manager').configure(env, configureUnprotectedPaths),
    basicAuth: require('../barona-js/basic-auth/basic-auth').configure(env.userDB)
  }
}