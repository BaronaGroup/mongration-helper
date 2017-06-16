const React = require('react'),
  { Router, Route, IndexRoute, browserHistory } = require('react-router'),
  MainNav = require('./main-nav'),
  TestItem = require('./test-item'),
  Dashboard = MainNav.Dashboard

module.exports = <Router history={browserHistory}>
    <Route path="/" component={MainNav}>
      <IndexRoute component={Dashboard}/>
      <Route path="item/:itemid" component={TestItem}>
        <Route path=":subid" component={TestItem.SubItem}/>
      </Route>
    </Route>
  </Router>