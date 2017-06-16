const axios = require('axios'),
  P = require('bluebird'),
  errors = require('./main/errors')

module.exports = doRequest

const retryableStatuses = [502, 503, 504],
  retryIntervals = [0, 3000, 10000, 20000]


function doRequest(config, retriesAlready = 0) {
  return P.resolve(axios(config))
    .catch(err => {
      if (err instanceof Error) {
        return retry(err)
      } else {
        if (retryableStatuses.includes(err.status)) {
          return retry(err)
        }
      }
      throw err
    })

  function retry(err) {
    const interval = retryIntervals[retriesAlready]
    if (interval === undefined) {
      const error = new Error('Request failed despite multiple retries: ' + (err.message || err.statusText || err.status))
      errors.showError(error)
      throw error
    }
    return P.delay(interval)
      .then(() => doRequest(config, ++retriesAlready))
  }
}