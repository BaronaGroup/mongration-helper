const winston = require('winston')

process.env.NODE_ENV = 'node-test'
require('../../server/configure-node')
require('../../server/promisify-all')
winston.info('Running only API tests')
