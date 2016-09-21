const wrapper = require('__bluebird-wrapper-path__')

module.exports = wrapper({
    id: '__migration-id__',

    async up(db) {
      db.collection('testcollection').insertAsync({ name: 'initial-setup' })
    },

    async down(db) {
      db.collection('testcollection').removeAsync({ name: 'initial-setup' })
    }
})