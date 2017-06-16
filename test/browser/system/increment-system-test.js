const { boot, unboot} = require('./system-test-support'),
  $ = require('jquery'),
  React = require('react'),
  ReactDOM = require('react-dom'),
  assert = require('chai').assert

describe('increment-system-test', function() {

  afterEach(() => {
    ReactDOM.unmountComponentAtNode($('#sut').get(0))
  })

  describe('system', function() {
    before(boot)
    after(unboot)
  })

  describe('unit', function() {
    it('works', function() {
      $('#sut').empty()
      const Counter = require('../../../client/js/main/counter')
      ReactDOM.render(<Counter />, document.querySelector('#sut'))
      assert.equal($('.counter .counter-value').text(), '0 balls')
      $('.counter button').click()
      assert.equal($('.counter .counter-value').text(), '1 ball')
    })
  })

})