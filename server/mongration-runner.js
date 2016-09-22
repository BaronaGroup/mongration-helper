exports.run = async function() {
  const config = JSON.parse(process.env.MONGRATION_HELPER_CONFIG),
    migration = process.env.MONGRATION_HELPER_MIGRATION,
    _ = require('lodash')

  for (let num of _.range(1, 20)) {
    console.log(`greetings from earth, ${num}`)
    await require('bluebird').delay(70)
  }
  if (Math.random() < 0.5) {
    console.log('Success.')
  } else {
    console.log('Failure.')
  }

}

