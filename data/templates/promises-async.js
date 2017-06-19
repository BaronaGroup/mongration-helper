const wrapper = require('__bluebird-wrapper-path__')

module.exports = wrapper({
    id: '__migration-id__',

    async up(db) {
      throw new Error('Not implemented')

      /*
      // Simple mongo usage
      const collection = db.collection('testcollection')
      await collection.insert({ name: 'initial-setup' })
      */

      /*
      // Loop using an array (loading everything into memory)
      const items = collection.find({})
      for (let item of await items.toArray()) {
        console.log(item)
      }
      */

      /*
      // Loop using a cursor (loading data separately for each iteration)
      const entries = collection.find({})
      let entry
      while(entry = await entries.nextObject()) { // eslint-disable-line no-cond-assign
        console.log(entry)
      }
      */
    },

    async down(db) {
      // rollback here
    }
})