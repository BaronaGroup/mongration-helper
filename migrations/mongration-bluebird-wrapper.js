const P = require('bluebird')
const mongodb = require("mongodb")
P.promisifyAll(mongodb)

module.exports = function(migrationDeclaration) {
  const output = {
    id: migrationDeclaration.id
  }
  if (migrationDeclaration.up) {
    output.up = (db, callback) => {
      P.resolve(migrationDeclaration.up(db)).asCallback(callback)
    }
  }
  if (migrationDeclaration.down) {
    output.down = (db, callback) => {
      P.resolve(migrationDeclaration.down(db)).asCallback(callback)
    }
  }
  return output
}