import React from 'react';
import Amplify from 'aws-amplify';
import awsConfig from './aws-exports';
import { withAuthenticator } from 'aws-amplify-react';

import { Router, Switch, Route } from "react-router-dom";
import { ThemeProvider } from "@material-ui/styles";

import { MainLayout } from "./layouts";
import theme from "./theme";

import ProfileList from "./pages/ProfileList";
import Drawer from "./pages/Drawer";

Amplify.configure(awsConfig)

const renderWithLayout = (Component, Layout) => <Layout>{Component}</Layout>;

const App = ({ history }) => (
  <ThemeProvider theme={theme}>
    <Router history={history}>
      <Switch>
        <Route
          path="/"
          exact
          render={() => renderWithLayout(<ProfileList />, MainLayout)}
        />
        <Route
          path="/drawer"
          exact
          render={() => renderWithLayout(<Drawer />, MainLayout)}
        />
        <Route
          path="/drawer/:id"
          exact
          render={() => renderWithLayout(<Drawer />, MainLayout)}
        />
      />
      </Switch>
    </Router>
  </ThemeProvider>
)

export default withAuthenticator(App, false)