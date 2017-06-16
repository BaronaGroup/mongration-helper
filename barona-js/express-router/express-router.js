
const express = require('express'),
  _ = require('lodash')

let permitOnlyExplicitNonPromiseRoutes = false

module.exports = function(parent, path) {
  const router = express.Router()

  parent.use(path, (req, res, next) => {
    req.routerParams = req.params
    return router(req, res, next)
  })

  const methods = ['get', 'put', 'post', 'delete', 'use'],
    traditional = wrapMethods(_.identity)

  traditional.del = traditional.delete
  traditional.async = wrapMethods(asyncMapper)
  traditional.async.del = traditional.async.delete

  if (permitOnlyExplicitNonPromiseRoutes) {
    const root = wrapMethods(forbid)
    root.use = traditional.use
    root.traditional = traditional
    root.async = traditional.async
    return root
  } else {
    return traditional
  }

  function wrapMethods(mapper) {
    return _.zipObject(methods, methods.map(method => wrap(method, mapper)))
  }

  function wrap(methodName, handlerMapper) {
    return function(...handlers) {
      if (_.isString(handlers[0])) {
        let route = handlers[0]
        if (!/^\//.test(route)) route = '/' + route
        return router[methodName](route, ...(handlers.slice(1, -1).concat(handlers.slice(-1).map(handlerMapper))))
      } else {
        return router[methodName](...(handlers.slice(0, -1).concat(handlers.slice(-1).map(handlerMapper))))
      }
    }
  }

  function asyncMapper(handler) {
    if (handler.length === 4) {
      return (err, req, res, next) => {
        const outputPromise = handler(err, req, res)
        if (!outputPromise.then) {
          return next(new Error('Promise expected from route implementation, got something else'))
        }
        return outputPromise
          .then(output => {
            if (output !== undefined) res.send(output)
          }, next)
      }
    } else {
      return (req, res, next) => {
        const outputPromise = handler(req, res)
        if (!outputPromise.then) {
          return next(new Error('Promise expected from route implementation, got something else'))
        }
        return outputPromise.then(output => {
          if (output !== undefined) res.send(output)
        }, next)
      }
    }
  }

  function forbid() {
    throw new Error('Only explicit non-promise routes are permitted using router.traditional[method]')
  }
}

module.exports.onlyExplicitNonPromiseRoutes = () => permitOnlyExplicitNonPromiseRoutes = true