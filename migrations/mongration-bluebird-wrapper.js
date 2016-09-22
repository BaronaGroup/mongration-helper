const P = require('bluebird')
tryPromisify('mongodb')
tryPromisify('mongration/node_modules/mongodb')

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

function tryPromisify(module) {
  try {
    const db = require(module)
    P.promisifyAll(db)
  } catch(e) {} //eslint-disable-line no-empty
}