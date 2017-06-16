require('../../client/js/configure-browser.js')

const _ = require('lodash'),
  $ = require('jquery'),
  axios = require('axios')

let testsInitialized = true

initLogToSelenium()

document.addEventListener('DOMContentLoaded', boot)

function boot() {
  const defaultOnErrorHandler = window.onerror
  window.onerror = testStartupErrorHandler

  mocha.setup({
    ui: 'bdd',
    globals: ['console', 'getInterface'],
    reporter: compoundReporter('html', seleniumVariableReporter),
    timeout: 10000,
    bail: true
  })

  $('#test-controls .toggle-sut').click(function() {
    $('#sut, #mocha').toggle()
  })
  $('#mocha').hide()

  before(function() {
    return fetch('/api/session/logout', { method: 'POST', credentials: 'same-origin'})
  })
  before(async () => {
    const response = await axios({url: `/translations/en.json`})
    require('../../client/js/general/t').setTranslations(response.data)
  })
  require('./**/*-test.js', {mode: 'expand'})
  window.onerror = defaultOnErrorHandler
  if (testsInitialized) {
    mocha.run(showResults)
  }
}

function showResults() {
  $('#sut').hide()
  $('#mocha').show()
}

function testStartupErrorHandler(msg, file, line, col, err) {
  testsInitialized = false
  const obj = {msg: msg, stack: file + ":" + line + ":" + col, err: err}
  console.error(err.message + "\n" + err.stack) // eslint-disable-line no-console
  window.seleniumTestResults = window.seleniumTestResults || []
  window.seleniumTestResults.push({type: 'log', logType: 'error', data: JSON.stringify(obj)})
  window.seleniumTestResults.push({type: 'end'})
  document.querySelector('body').innerText = 'Test initialization failed.'
}


function compoundReporter() {
  const reporters = _.toArray(arguments).map(instantiateReporter)
  return function(runner) {
    reporters.forEach(function(reporter) { new reporter(runner) })
    return this
  }

  function instantiateReporter(x) {
    if (_.isFunction(x)) return x
    const orig = mocha._reporter
    mocha.reporter(x)
    const r = mocha._reporter
    mocha._reporter = orig
    return r
  }
}

function seleniumVariableReporter(runner) {
  window.seleniumTestResults = []
  runner.on('pass', function(test) {
    window.seleniumTestResults.push({type: 'pass', test: test.fullTitle()})
  })
  runner.on('fail', function(test, err) {
    window.seleniumTestResults.push({type: 'fail', test: test.fullTitle(), message: err.message, stack: err.stack})
  })
  runner.on('end', function() { window.seleniumTestResults.push({type: 'end'})})
}

function initLogToSelenium() {
  wrap('log')
  wrap('warn')
  wrap('error')

  function wrap(logFnName) {
    const original = console[logFnName] // eslint-disable-line no-console
    console[logFnName] = function() { // eslint-disable-line no-console
      original.apply(this, arguments)
      window.seleniumTestResults.push({type: 'log', logType: logFnName, data: JSON.stringify(_.toArray(arguments), null, 2)})
    }
  }
}