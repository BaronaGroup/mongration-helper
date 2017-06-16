const assert = require('chai').assert,
    server = require('../../server/server'),
    request = require('request')

describe('healthcheck', () => {
    before(server.boot)
    after(server.shutdown)
    it('should return success true', async () => {
        const response = await request.getAsync('http://health:1cb3c8d7f0422dfe64536456ee91ba6c@localhost:3802/api/ext/health', { json: true })
        assert.equal(response.statusCode, 200)
        assert.deepEqual(response.body.success, true)
    })
})