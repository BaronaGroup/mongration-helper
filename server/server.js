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

exports.boot = async function() {
  if (server) throw new Error('Already running')
  const env = envs.select()
  const app = configureApp(env)
  const port = env.port
  server = app.listen(port, '127.0.0.1')
  winston.info(`Server listening in port ${port}`)
}

exports.shutdown = async function() {
  if (!server) throw new Error('Not running')
  await P.fromNode(callback => server.close(callback))
  server = null
}

function configureApp(env) {
  const app = express()

  const nodeGetOptLong = require('node-getopt-long')

  const config = nodeGetOptLong.options([
    ['template|f=s', 'Template to use'],
    ['bluebirdWrapperPath|b=s', 'Path to bluebird wrapper as used from migration scripts, if relevant to selected template'],
    ['migrationCollection|c=s', 'Collection to use for migration status. Can be the same as used for producion, not necessary though'],
    ['devMigrationsPath|d=s', 'The path in which migrations being developed are to be stored'],
    ['prodMigrationsPath|p=s', 'The path in which committed migrations are to be stored'],
    ['mongoUrl|m=s', 'Mongo URL'],

  ], {
    name: 'finder-o2-migration-tool',
    commandVersion: 0.1,
    defaults: {
      template: __dirname + '/../data/templates/promises-async.js',
      bluebirdWrapperPath: '../mongration-bluebird-wrapper',
      mongoUrl: 'mongodb://localhost/migration-test',
      devMigrationsPath: __dirname + '/../migrations/dev',
      prodMigrationsPath: __dirname + '/../migrations/ready',
      migrationCollection: 'migrationversion'
    }
  });

  const shared = require('./server-shared').configure(env)
  shared.config = config
  
  if (env.test) {
    app.get('/', (req, res, next) => {
      res.redirect('test.html')
    })
  }

  app.use(less('../less', {dest: '/css', pathRoot: __dirname + '/../client/public'}))

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
  app.get('/js/libs.js', browserify.libs)
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