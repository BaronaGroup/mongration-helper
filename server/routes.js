exports.configure = function (app, env, shared) {
    const routers = [
        'ext/health.js',
        'session.js',
        'system.js'
    ],
      testRouters = [
        'test/mocha.js'
      ],
      devRouters = [
        'dev/translate.js'
      ]
    const allRouters = routers.concat(env.test ? testRouters : []).concat(env.dev ? devRouters : [])
    for (let router of allRouters) {
        require(`./routes/${router}`).configure(app, env, shared)
    }
}