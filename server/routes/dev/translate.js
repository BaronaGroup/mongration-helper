const router = require('../../barona-router'),
  {UserError} = require('../../server-errors'),
  fs = require('fs'),
  _ = require('lodash')

exports.configure = function(app, env, shared) {
  function configureRoutes() {
    const translate = router(app, '/api/dev')
    translate.async.post('translate/:language', updateTranslation)

    app.post('/api/dev/translate/en', function(req,res,next) {
      res.send('kekeke' + req.params.qqq)
    })

  }

  async function updateTranslation(req, res) {
    const language = req.params.language
    if (!language || !language.match(/^[\w]+$/)) throw new UserError(400, 'Invalid language format')
    const key = req.body.key
    if (!key) throw new UserError(400, 'Missing key')
    const filename = `${__dirname}/../../../client/public/translations/${language}.json`
    const stats = await fs.statAsync(filename)
    if (!stats.isFile()) throw new UserError(400, 'Invalid language')
    const rawContents = await fs.readFileAsync(filename, 'UTF-8'),
      translations = JSON.parse(rawContents)
    _.set(translations, key, req.body.translation)
    await fs.writeFileAsync(filename, JSON.stringify(translations, null, 2), 'UTF-8')
    return {ok: true}
  }

  configureRoutes()
}