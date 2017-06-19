const wrapper = require('../mongration-bluebird-wrapper')

module.exports = wrapper({
    id: '2016-9-21--test2',

    async up(db) {
      db.collection('testcollection').insertAsync({ name: 'initial-setup' })
    },

    async down(db) {
      db.collection('testcollection').removeAsync({ name: 'initial-setup' })
    }
})