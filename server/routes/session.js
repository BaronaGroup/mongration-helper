const bodyParser = require('body-parser'),
  router = require('../barona-router'),
  P = require('bluebird')

exports.configure = function(app, env, shared) {
  function configureRoutes() {
    const publicSession = router(app, '/api/public/session')
    publicSession.post('login', bodyParser.urlencoded({extended: true}), login)

    const session = router(app, '/api/session')
    session.async.post('logout', logout)
  }

  function login(req, res, next) {
    P.resolve(shared.authManager.login(req, res, req.body.username, req.body.password))
      .then(
        () => res.redirect('/'),
        e => {
          if (e instanceof shared.authManager.errors.LoginFailedError) {
            res.redirect('/?loginError=login-failed')
          } else if (e instanceof shared.authManager.errors.AccessDeniedError) {
            res.redirect('/?loginError=access-denied')
          } else if (e instanceof shared.authManager.errors.PasswordExpiredError) {
            // There is no useful implementation for what to do after this point yet
            res.redirect('/?loginError=password-expired')
          } else {
            next(e)
          }
        })
  }

  async function logout(req, res, next) {
    await shared.authManager.logout(req, res)
    return ({ok: true})
  }

  configureRoutes()
}