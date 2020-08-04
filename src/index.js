import React from "react";
import ReactDOM from "react-dom";
import { Provider } from 'react-redux';
import createStore from './store/createStore'
import * as serviceWorker from "./serviceWorker";
import './index.css';

const history = require('history')

// =========================================
// Store Instantiation
// =========================================
const initialState = {
};

const browserHistory = history.createBrowserHistory();
const store = createStore(initialState, browserHistory);

// =========================================
// Render
// =========================================
const composeApp = App => (
    <Provider store={store}>
      <App history={browserHistory} />
    </Provider>
)

const renderApp = () => {
  const App = require('./App').default
  ReactDOM.render(composeApp(App), document.getElementById('root'))
}

renderApp()

if (module.hot) {
  module.hot.accept('./App', renderApp)
}

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
