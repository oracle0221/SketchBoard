import React from 'react';
import { Route, Switch} from 'react-router-dom';
import 'App.css';

import Index from 'page/index'
import Map from 'page/map/index'
import Layout from 'page/layout/index'

function App() {
  return (
    <div className="App">
      <Switch>
        <Route path="/" exact component={Index} />
        <Route path="/map" component={Map} />
        <Route path="/layout" component={Layout} />
      </Switch>
    </div>
  );
}

export default App;
