const router = require('../barona-router'),
  {UserError} = require('../server-errors'),
  fs = require('fs'),
  _ = require('lodash'),
  childProcess = require('child_process'),
  Html5Entities = require('html-entities').Html5Entities,
  P = require('bluebird')

exports.configure = function(app, env, shared) {
  const systemRouter = router(app, '/api')
  systemRouter.async.get('config', sendConfig)
  systemRouter.async.get('migrations', getMigrations)
  systemRouter.async.post('migration', createMigration)
  systemRouter.async.get('migration/run/:name', runMigration)

  async function sendConfig(req, res) {
    return shared.config
  }

  async function getMigrations() {
    const dir = await fs.readdirAsync(shared.config.devMigrationsPath)
    const invalid = /^\.+$/
    return dir.filter(item => !invalid.test(item))
  }

  async function createMigration(req) {
    const config = shared.config
    const name = req.body.name
    const validName = /^[\w\d\-_]{1,100}$/
    if (!validName.test(name)) {
      throw new UserError(400, 'Invalid name')
    }
    const template = await fs.readFileAsync(config.template, 'UTF-8')
    const today = new Date()
    const prefix = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}T${today.getHours()}-${today.getMinutes()}-`
    const fullName = `${prefix}${name}`
    const filledTemplate = template
      .replace(/__migration-id__/g, fullName)
      .replace(/__bluebird-wrapper-path__/g, config.bluebirdWrapperPath)

    await fs.writeFileAsync(`${config.devMigrationsPath}/${fullName}.js`, filledTemplate, 'UTF-8')
    return {ok: true}
  }

  async function runMigration(req, res) {
    const migrationName = req.params.name
    const cp = childProcess.fork( __dirname + '/../mongration-runner-init', [], {
      env: {
        MONGRATION_HELPER_CONFIG: JSON.stringify(shared.config),
        MONGRATION_HELPER_MIGRATION: migrationName
      },
      silent: true,
      stdio: ['pipe','pipe','pipe', 'ipc']
    })

    res.write(`
      <html>
        <head>
        <script src="/autoscroll.js"></script>
          <link rel="stylesheet" href="/css/styles.css" />
        </head>
        <body class=log>`)

    cp.stdout.on('data', (data) => {
      res.write(`<span class="stdout">${Html5Entities.encode(data.toString('UTF-8'))}</span>`)
    })

    cp.stderr.on('data', (data) => {
      res.write(`<span class="stderr">${Html5Entities.encode(data.toString('UTF-8'))}</span>`)
    })

    await new P(resolve => {
      cp.on('close', function(code) {
        if (code !== 0) {
          res.write(`<span>Response code ${code}</span>`)
        }
        return resolve()
      })
    })

    res.write('</body></html>')
    res.end()
  }
}