const router = require('../barona-router'),
  {UserError} = require('../server-errors'),
  fs = require('fs'),
  _ = require('lodash')

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
    const prefix = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}-`
    const fullName = `${prefix}${name}`
    const filledTemplate = template
      .replace(/__migration-id__/g, fullName)
      .replace(/__bluebird-wrapper-path__/g, config.bluebirdWrapperPath)

    await fs.writeFileAsync(`${config.devMigrationsPath}/${fullName}.js`, filledTemplate, 'UTF-8')
    return {ok: true}
  }

  async function runMigration(req, res) {
    res.write(`
      <html>
        <head>
          <style type="text/css">
              body {
                  white-space: pre-wrap;
              }
          </style>
        </head>
        <body>`)
    for (let num of _.range(1, 10)) {
      res.write('<div>')
      res.write(`greetings from earth, ${num}\n`)
      res.write('</div>')
      await require('bluebird').delay(150)
    }
    if (Math.random() < 0.5) {
      res.write('Success.')
    } else {
      res.write('Failure.')
    }
    res.write('</body></html>')
    res.end()
  }
}