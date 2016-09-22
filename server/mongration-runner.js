'use strict'
const Migration = require('mongration').Migration,
  P = require('bluebird'),
  _ = require('lodash'),
  mongodb = require('mongodb')

P.promisifyAll(mongodb)

exports.run = async function() {
  try {
    const config = JSON.parse(process.env.MONGRATION_HELPER_CONFIG),
      migrationName = process.env.MONGRATION_HELPER_MIGRATION


    const migration = new Migration({
      mongoUri: config.mongoUrl,
      migrationCollection: config.migrationCollection
    })

    migration.add(`${config.devMigrationsPath}/${migrationName}`)

    const results = await P.fromNode(callback => migration.migrate(callback))
    // Success, now unflag it
    const dbConnection = await mongodb.MongoClient.connectAsync(config.mongoUrl)
    await dbConnection.collection(config.migrationCollection).removeAsync({id: require(`${config.devMigrationsPath}/${migrationName}`).id})
    dbConnection.close()
    console.log(JSON.stringify(results, null, 2))
    console.log('\nSuccess.')
  } catch(e){
    console.error(e.message)
    console.error(e.stack)
    console.log('\nFailure.')
  }

}

