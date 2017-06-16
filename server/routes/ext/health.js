const P = require('bluebird'),
  _ = require('lodash'),
  router = require('../../barona-router')

exports.configure = function(app, env, shared) {
  const healthRouter = router(app, '/api/ext/health')
  healthRouter.use(shared.basicAuth.middlewareFor('health'))
  healthRouter.get('', health)

  function health(req, res, next) {
    const checks = {
      auth: env.authProvider.ping()
    }

    P.all(_.toPairs(checks).map(pair => {
      const start = new Date().valueOf()
      return pair[1].then(
        () => ({service: pair[0], success: true, duration: new Date().valueOf() - start}),
        err => ({service: pair[0], success: false, err: err})
      )
    }))
      .then(completedChecks => {
        res.send({
          success: _.every(completedChecks, { success: true}),
          timeTaken: _(completedChecks).filter({ success: true}).map(check => [check.service, check.duration]).fromPairs().value(),
          failures: _(completedChecks).filter({ success: false}).map(check => [check.service, check.err]).fromPairs().value()
        })
      })

  }
}