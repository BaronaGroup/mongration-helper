const router = require('../barona-router'),
  {ServerError} = require('../server-errors')

exports.configure = function(app, env, shared) {
  const systemRouter = router(app, '/api/system')
  systemRouter.get('settings', settings)

  function settings(req, res, next) {
    res.send({
      env: {
        name: env,
        type: env.test ? 'test'
          : env.dev ? 'dev'
          : env.production ? 'production'
          : 'unknown'
      },
      user: {
        name: req.session.user.name
      },
      supportedLanguages: env.supportedLanguages
    })
  }

  systemRouter.get('status/:code', function(req, res) {
    res.status(req.params.code)
    res.send({ok: true})
  })

  systemRouter.async.get('fail-sometimes', async (req, res) => {
      if (Math.random() < 0.05) {
        return {text: new Date().toISOString()}
      } else if (Math.random() < 0.9) {
        throw new ServerError(503)
      } else {
        throw new ServerError(405)
      }
    }
  )

}