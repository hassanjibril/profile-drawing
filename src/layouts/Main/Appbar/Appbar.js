import React from "react";
import { Auth } from 'aws-amplify';

import clsx from "clsx";
import { makeStyles, withStyles } from "@material-ui/core/styles";
import {
  AppBar,
  Toolbar,
} from "@material-ui/core";
import { withRouter } from "react-router";

// import Logo from "./admin-logo.png";

const useStyles = makeStyles(theme => ({
  grow: {
    flexGrow: 1
  },
  appTitle: {
    backgroundColor: "transparent",
    color: "white",
    fontSize: "1.5rem",
    fontWeight: 600,
    padding: theme.spacing(1, 1, 1, 3),
    transition: theme.transitions.create("width"),
    width: "100%",
  },
  sectionDesktop: {
    display: "none",
    width: "100%",
    [theme.breakpoints.up("md")]: {
      display: "flex",
      width: 250
    }
  },
  appBar: {
    // backgroundColor: 'white' ,
    // color: '#c1c1c1',
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen
    }),
    "& a": {
      color: "inherit"
    }
  },
  logout: {
    backgroundColor: "transparent",
    color: "red",
    fontSize: "1.5rem",
    fontWeight: 600,
    cursor: "pointer",
    padding: theme.spacing(1, 1, 1, 3),
    transition: theme.transitions.create("width"),
    width: "100%"
  },
  logoutSpan: {
    float: "right"
  }
}));

const StyledToolbar = withStyles(theme => ({
  regular: {
    minHeight: "60px"
  }
}))(Toolbar);

function Appbar({
  history
}) {
  const classes = useStyles();
  return (
    <div className={classes.grow}>
      <AppBar position="fixed" className={clsx(classes.appBar)}>
        <StyledToolbar>
          <div className={classes.appTitle}>
            <span>Profile Drawer</span>
          </div>
          <div className={classes.grow} />
          <div className={classes.sectionDesktop}>
            <div className={classes.logout} onClick={()=>Auth.signOut()}>
              <span className={classes.logoutSpan}>Log Out</span>
            </div>
          </div>
        </StyledToolbar>
      </AppBar>
    </div>
  );
}

export default withRouter(Appbar);
