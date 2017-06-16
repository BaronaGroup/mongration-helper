const express = require('express'),
  envs = require('./envs'),
  winston = require('winston'),
  bodyParser = require('body-parser'),
  P = require('bluebird'),
  session = require('express-session'),
  less = require('less-middleware'),
  routes = require('./routes'),
  {RedirectError, middleware: serverErrorMiddleware} = require('./server-errors')

let server

function configureUnprotectedPaths(helpers) {
  const {exactURL, regexp} = helpers
  return [
    exactURL('/'),
    exactURL('/favicon.ico'),
    regexp(/^\/css/),
    regexp(/^\/images/),
    regexp(/^\/api\/public\//),
    regexp(/^\/api\/ext\//), // uses other means of authentication
    exactURL('/js/libs.js'),
    exactURL('/js/login.js')
  ]
}

function getSessionCookieName(env) {
  return !env.test ? 'jelpp-session' : 'jelpp-test-session'
}

exports.boot = async function() {
  if (server) throw new Error('Already running')
  const env = envs.select()
  const app = configureApp(env)
  const port = env.port
  server = app.listen(port)
  winston.info(`Server listening in port ${port}`)
}

exports.shutdown = async function() {
  if (!server) throw new Error('Not running')
  await P.fromNode(callback => server.close(callback))
  server = null
}

function configureApp(env) {
  const app = express()
  const shared = require('./server-shared').configure(env, configureUnprotectedPaths)
  if (env.test) {
    app.get('/', (req, res, next) => {
      res.redirect('test.html')
    })
  }

  app.use(less('../less', {dest: '/css', pathRoot: __dirname + '/../client/public'}))

  app.use(session({
    name: getSessionCookieName(env),
    secret: '24c9aa642ec93b22ba9e0c530ce24a04',
    saveUninitialized: false,
    resave: false
  }))
  app.use(shared.authManager.middleware)
  app.use(express.static(__dirname + '/../client/public'))

  app.use(bodyParser.json())

  routes.configure(app, env, shared)

  configureBrowserifyRoutes(app, env)
  app.use(redirectErrorHandler)
  app.use(sendClientOnNonApi401)
  app.use(sendClientOnNonApi404)
  app.use(serverErrorMiddleware(env))
  return app
}

function configureBrowserifyRoutes(app, env) {
  const browserify = require('./browserify').configure(env)
  app.get('/js/client.js', browserify.client)
  app.get('/js/login.js', browserify.login)
  app.get('/js/libs.js', browserify.libs)
  app.get('/js/browser-tests.js', browserify.test)
}

function redirectErrorHandler(err, req, res, next) {
  if (err instanceof RedirectError) {
    res.redirect(err.url)
  } else {
    next(err)
  }
}

function sendClientOnNonApi401(err, req, res, next) {
  if (req.url.startsWith('/api/')) {
    return next(err)
  }
  if (err && err.code !== 401) return next()
  res.status(401)
  return res.sendFile('index.html', { root: __dirname + '/../client/public'})
}
function sendClientOnNonApi404(req, res, next) {
  if (req.url.startsWith('/api/')) {
    return next()
  }
  res.status(404)
  return res.sendFile('index.html', { root: __dirname + '/../client/public'})
}