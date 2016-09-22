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
  systemRouter.async.get('migration/run/:name', runMigration)
  systemRouter.async.post('migrations/commit', commit)

  async function sendConfig(req, res) {
    return shared.config
  }

  async function getMigrations() {
    const dir = await fs.readdirAsync(`${shared.config.pathsRelativeTo}${shared.config.devMigrationsPath}`)
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
    const prefix = `${today.getFullYear()}-${pad2(today.getMonth() + 1)}-${pad2(today.getDate())}T${pad2(today.getHours())}-${pad2(today.getMinutes())}-`
    const fullName = `${prefix}${name}`
    const filledTemplate = template
      .replace(/__migration-id__/g, fullName)
      .replace(/__bluebird-wrapper-path__/g, config.bluebirdWrapperPath)

    await fs.writeFileAsync(`${config.pathsRelativeTo}${config.devMigrationsPath}/${fullName}.js`, filledTemplate, 'UTF-8')
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

  async function commit(req, res) {
    const config = shared.config
    const migrations = req.body.migrations
    if (!_.isArray(migrations)) throw new UserError(400, 'Missing migrations')
    for (let migration of migrations) {
      await fs.renameAsync(`${config.pathsRelativeTo}${config.devMigrationsPath}/${migration}`, `${config.pathsRelativeTo}${config.prodMigrationsPath}/${migration}`)
    }
    res.send({ok: true})
  }
}

function pad2(num) {
  const s = num.toString()
  if (s.length === 1) return '0' + s
  return s
}