const P = require('bluebird'),
  os = require('os'),
  events = require('events'),
  env = require('../../server/envs').select(),
  app = require('../../server/server'),
  winston = require('winston'),
  _ = require('lodash'),
  webdriver = require('selenium-webdriver')

const config = {
  browser: process.env.SELENIUM_BROWSER || 'chrome',
  server: 'http://selenium7.intra.barona.fi:4444/wd/hub'
}

exports.run = function() {
  const grep = process.argv[2] || ''

  const testResults = {}
  startRunningSeleniumTests(grep)
    .on('progress', details => {
      testResults[details.test] = details
      logTestResult(details)
    })
    .on('end', () => {
      let anyFailed = _.some(Object.values(testResults), {passed: false})
      winston.info('Test run complete, summary follows')
      Object.values(testResults).forEach(logTestResult)
      process.exit(anyFailed ? 1 : 0)
    })

  function logTestResult(details) {
    const testName = details.test
    if (!details.passed) {
      winston.error(`not ok ${testName} ${details.message} ${JSON.stringify(details.stack).replace(/\\n/g, '\n')}`)
    } else {
      winston.info(`ok ${testName}`)
    }
  }
}

function startRunningSeleniumTests(grep) {
  if (!config)
    throw new Error('Attempting to run client side tests with no selenium configured!')

  let driver = new webdriver
    .Builder()
    .usingServer(config.server)
    .withCapabilities(webdriver.Capabilities[config.browser]())
    .build()

  const host = determineHostToHaveSeleniumBrowseTo()

  const url = `http://${host}:${env.port}/?grep=${encodeURIComponent(grep)}`
  const progress = new events.EventEmitter()
  app.boot().then(openSeleniumAndRunTests)
  return progress

  function openSeleniumAndRunTests() {
    process.on('SIGINT', killOnSignal)
    process.on('SIGTERM', killOnSignal)
    process.on('SIGBREAK', killOnSignal)

    winston.info("Selenium opening %s", url)
    driver.get(url)

    monitorProgress()

    async function killOnSignal() {
      await killDriverAndServer()
      process.exit(127)
    }

    function killDriverAndServer() {
      if (!driver) return P.resolve()
      process.removeListener('SIGINT', killOnSignal)
      process.removeListener('SIGTERM', killOnSignal)
      process.removeListener('SIGBREAK', killOnSignal)

      const currentDriver = driver
      driver = null

      return P.all([
        currentDriver.quit(),
        app.shutdown()
      ])

    }

    function monitorProgress() {
      const notificationHandlers = getNotificationHandlers()

      P.try(async function run() {
        for (; ;) {
          if (!driver) return
          const unprocessedNotifications = await driver.executeScript('var res = window.seleniumTestResults; window.seleniumTestResults = []; return res')
          for (let notification of unprocessedNotifications) {
            await notificationHandlers[notification.type](notification)
          }
          await P.delay(2000)
        }
      }).catch(err => {
        return killDriverAndServer()
          .thenThrow(err)
      })

      function getNotificationHandlers() {
        async function fail(notification) {
          progress.emit('progress', _.extend({}, notification, {passed: false}))
        }

        async function pass(notification) {
          progress.emit('progress', _.extend({}, notification, {passed: true}))
        }

        async function end() {
          await killDriverAndServer()
          progress.emit('end')
        }

        async function log(notification) {
          const winstonLogTypes = {
            error: 'error',
            log: 'info',
            warn: 'warn'
          }
          winston.log(winstonLogTypes[notification.logType], notification.data)
        }

        return {fail, pass, end, log}
      }
    }
  }
}

function determineHostToHaveSeleniumBrowseTo() {
  if (env.host) return env.host
  const candidates = _(os.networkInterfaces()).values()
    .flatten()
    .filter({ internal: false, family: 'IPv4' })
    .value()

  const baronaIps = candidates.filter(function(candidate) {
    return candidate.address.startsWith('10.0.180.')
     || candidate.address.startsWith('10.0.156.')
  })

  if (baronaIps.length) return baronaIps[0].address
  if (candidates.length) return candidates[0].address

  return '127.0.0.1'
}
