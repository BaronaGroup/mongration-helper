const axios = require('axios'),
  _ = require('lodash'),
  React = require('react'),
  P = require('bluebird')

let activeStreamReq = null,
  uid = 0

exports.stream = url => {
  return activeStreamReq.stream(url)
}

exports.Log = class Log extends React.Component {
  constructor() {
    super()
    this.state = {items: []}
  }

  componentDidMount() {
    activeStreamReq = this
  }

  componentWillUnmount() {
    activeStreamReq = null
  }

  render() {
    return <div>
      {this.state.items.map(item => <iframe key={item.uid} className={item.hidden ? 'hidden' : ''} onLoad={e=>item.loaded(e, item)}
                                            src={item.url}/>)}
    </div>
  }

  setItems(items) {
    const filteredItems = items.filter(item => !(item.done && item.hidden))
    this.setState({items: filteredItems})
  }

  stream(url) {
    const that = this
    return new P(resolve => {

      for (let item of this.state.items) {
        item.hidden = true
      }
      const items = this.state.items.concat([{
        url,
        loaded,
        uid: ++uid
      }])
      that.setItems(items)

      function loaded(e, item) {
        item.done = true
        const data = e.target.contentDocument.querySelector('body').textContent
        const success = _.last(data.split('\n')) === 'Success.'
        resolve({success, log: data})
      }
    })
  }
}
