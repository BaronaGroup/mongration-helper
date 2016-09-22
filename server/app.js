#!/usr/bin/env node

'use strict'
// Since babel has not yet been configured, we can only use features natively supported by node 4.3
const winston = require('winston')

require('./configure-node')
require('./server').boot()
  .catch(e => winston.error(e))