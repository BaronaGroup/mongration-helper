"use strict"

var _ = require('lodash'),
  browserify = require('browserify'),
  watchify = require('watchify'),
  stringifyAlternative = require('./stringify-alternative'),
  P = require('bluebird')


exports.configure = function(opts) {

  var noParseLibraries = opts.noParseLibraries || []
  var parsedLibraries = opts.parsedLibraries || []

  var libraries = noParseLibraries.concat(parsedLibraries)

  var defaultOpts = {cache: {}, packageCache: {}, debug: !!opts.debug, extensions: ['.jsx']},
    bundleInvalidators = [],
    bundleUpdaters = []

  function invalidateBundles() {
    var fns
    var tenMinutes = 1000 * 60 * 10
    if (GLOBAL.lastRequest && new Date() - GLOBAL.lastRequest < tenMinutes) {
      console.log('Updating bundles immediately.')
      fns = bundleUpdaters
    } else {
      fns = bundleInvalidators
    }

    fns.forEach(function(fn) {
      fn()
    })
  }

  return {
    configureRoute: configureRoute,
    configureLibraryRoute: configureLibraryRoute
  }

  function configureRoute(root, preBuild) {
    return configureRouteImpl(function() {
      var generalRouteOpts = {
        transform: [
          stringifyAlternative(/\.(html|css)$/)
        ].concat(opts.transforms || [])
      }

      return browserify(root, _.extend({}, defaultOpts, generalRouteOpts))
        .external(libraries)
    }, preBuild)
  }

  function configureLibraryRoute(preBuild) {
    return configureRouteImpl(function() {
      return browserify(_.extend({}, defaultOpts, {noParse: noParseLibraries}))
        .require(libraries)
    }, preBuild)
  }

  function configureRouteImpl(browserifyConfigFn, preBuild) {
    var w = watchify(browserifyConfigFn()),
      bundled

    bundleInvalidators.push(function() {
      bundled = null
    })
    bundleUpdaters.push(updateBundle)
    w.on('update', function(ids) {
      console.log('Changes detected in ', ids.join(', '))
      invalidateBundles()
    })

    if (preBuild && !process.env.NO_PRE_BUNDLE) {
      updateBundle()
    }

    function updateBundle() {
      bundled = createPromise(function(resolve, reject) {
        var data = ''
        w.bundle()
          .on('error', function(e) {
            console.log('Bundling failed:', e)
            reject(e)
          })
          .on('data', function(d) {
            data += d.toString('UTF-8')
          })
          .on('end', function() {
            resolve(data)
          })
      })
    }

    return function(req, res, next) {
      res.set('Content-Type', 'application/javascript; charset=utf-8')
      if (!bundled) updateBundle()
      bundled.then(function(data) {
        res.send(data)
      }, next)

    }
  }

}

function createPromise(fn) {
  return new P(fn)
}