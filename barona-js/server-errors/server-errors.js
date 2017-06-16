const _ = require('lodash'),
  winston = require('winston'),
  util = require('util')


function ExtendableErrorBase(message) {
  Error.captureStackTrace(this, this)
  this.message = message || 'Error'
}

util.inherits(ExtendableErrorBase, Error)
class ExtendableError extends ExtendableErrorBase {
  constructor(message) {
    super()
    this.name = this.constructor.name
    this.message = message || 'Unknown error'
    Error.captureStackTrace(this, this)
  }
}

// all arguments are optional; numbers are primarily considered to be the response code,
// if there is only one argument, if it is an Error it is considered to be the err, otherwise details
class HttpError extends ExtendableError {
  constructor(...varargs /*err, responseCode, message, details; all optional*/) {
    super()
    const parsed = parseParameters(varargs)
    this.err = parsed.err || null
    this.code = parsed.responseCode || 500
    this.message = (parsed.message || (parsed.details && parsed.details.message) || this.code).toString()
    this.details = parsed.details || null
    this.name = this.constructor.name
    if (parsed.err && parsed.err.stack) {
      this.stack = parsed.err.stack
    }

    function parseParameters(args) {
      const result = {}
      if (args[0] instanceof Error) result.err = getAndRemoveNextArg()
      if (_.isNumber(args[0])) result.responseCode = getAndRemoveNextArg()
      if (_.isString(args[0])) result.message = getAndRemoveNextArg()
      if (args[0]) result.details = getAndRemoveNextArg()
      return result

      function getAndRemoveNextArg() {
        const value = args[0]
        args = args.slice(1)
        return value
      }
    }
  }
}

class UserError extends HttpError {
  constructor(...varargs) {
    super(...varargs)
    if (this.code >= 500) {
      winston.warn(`UserError probably should not have the response code ${this.code}, did you mean to use ServerError?`)
      winston.warn(new Error().stack)
    }
  }
}
class ServerError extends HttpError {
  constructor(...varargs) {
    super(...varargs)
  }
}

class RedirectError extends ExtendableError {
  constructor(url) {
    super('Redirecting user to ' + url)
    this.url = url
  }
}

function middleware(options) {
  const {quiet, dev, useRefIds = true} = options
  return function errorHandlerImpl(err, req, res, next) { // eslint-disable-line no-unused-vars
    if (validHttpStatus(err.status || err.code)) {
      res.statusCode = Number(err.status || err.code)
    } else {
      res.statusCode = 500
    }

    const refId = new Date().valueOf()
    if ((!quiet && !(err instanceof UserError) || err instanceof TypeError || err instanceof ReferenceError || err instanceof SyntaxError)) {
      winston.error('[' + req.method + ':' + req.url + '] ~~ ' + refId + ' ~~ ' + JSON.stringify(err.stack || 'No stack').replace(/\\n/g, '\n') + ' ' + JSON.stringify(err.message || err))
    }

    const accept = req.headers.accept || ''
    if (~accept.indexOf('json')) {
      let json
      if (err instanceof HttpError) {
        const details = (dev || err instanceof UserError) && err.details || {}
        details.message = err.details && err.details.message || err.message
        json = {userError: _.extend({refId: refId, type: err.name}, details)}
      } else {
        const error = {message: err.message || err, refId: refId}
        for (let prop in err) error[prop] = err[prop]
        json = {error: error}
      }
      res.setHeader('Content-Type', 'application/json')
      res.send(json)
    } else {
      res.writeHead(res.statusCode, {'Content-Type': 'text/plain'})
      res.end((err.message || err) + (useRefIds ?  ', refId ' + refId : ''))
    }
  }

  function validHttpStatus(input) {
    const asNumber = Number(input)
    return asNumber >= 100 && asNumber <= 600
  }
}


module.exports = {
  middleware: middleware,
  HttpErrorBase: HttpError,
  UserError,
  ServerError,
  ExtendableError,
  RedirectError
}
