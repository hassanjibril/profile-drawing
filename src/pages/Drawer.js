import React, { useRef, useEffect } from 'react';

import { withRouter } from "react-router";
import { connect } from 'react-redux';
import { createProfile, updateProfile, loadProfile, profileSelector } from '../actions/profile';
import { isLoading } from '../actions/loading';

import { makeStyles } from "@material-ui/core/styles";
import {
    TextField,
    Grid,
    Divider,
    Button
  } from "@material-ui/core";
import InputBase from '@material-ui/core/InputBase';
import SaveIcon from '@material-ui/icons/Save';
import KeyboardBackspaceIcon from '@material-ui/icons/KeyboardBackspace';

import { useIsMobileOrTablet } from "../utils/isMobileOrTablet";

import CanvasComponent from "../component/Canvas";

const useStyles = makeStyles(theme => ({
    container: {
        flex: 1
    },
    backIcon: {
        backgroundColor: 'purple',
        marginRight: theme.spacing(3),
        cursor: "pointer",
        fontSize: "30px",
    },
    input: {
        display: 'none',
    },
    gridRoot: {
        width: "100%",
    },
    root: {
        marginTop: theme.spacing(3),
        width: '100%',
        backgroundColor: theme.palette.background.paper,
    },
    space: {
        marginTop: theme.spacing(3),
        backgroundColor: "#3e4656",
        width: theme.spacing(7),
    },
    static: {
        paddingTop: theme.spacing(2),
        paddingLeft: theme.spacing(2)
    },
    title: {
        padding: 0
    },
    content: {
        color: "black",
        fontWeight: 800,
        fontSize: "20px"
    },
    saveButton: {
        margin: theme.spacing(2),
        padding: theme.spacing(1.5),
        marginRight: theme.spacing(7),
        float: "right",
        cursor: "pointer"
    },
    upwardIcon: {
        backgroundColor: "blue",
        fontSize: "40px",
        margin: theme.spacing(1.5),
        marginLeft: "30%",
        cursor: "pointer"
    },
    downwardIcon: {
        backgroundColor: "blue",
        fontSize: "40px",
        margin: theme.spacing(1.5),
        cursor: "pointer"
    },
    textField: {
        margin: theme.spacing(1,1,1,0),
        width: "100%",
        fontSize: '2.4rem'
    },
    textactiveField: {
        margin: theme.spacing(1,1,1,0),
        fontSize: '2.4rem',
        width: "100%",
    },
    checkbox: {
        paddingLeft: 0,
    },
    canvasContainer: {
        width: "100%",
        height: "100%",
        minHeight: "450px",
        padding: theme.spacing(3,1,1,1)
    },
    canvas: {
        marginTop: theme.spacing(3)
    },
    inputPoint: {
        textAlign: "center",
        width: "50px"
    },
    alertIcon: {
        marginBottom: "-5px",
        color: "orange"
    },
    alertText: {
        fontWeight: 800,
        color: "orange",
        padding: "10px",
    }
}));

function Drawer({
    createProfile,
    updateProfile,
    loadProfile,
    getProfile,
    loading,
    match,
    history
}) {
    const classes = useStyles();
    const isMobOrTab = useIsMobileOrTablet();
    const canvasRef = useRef();
    const [pointInfo, setPointInfo] = React.useState([{}]);
    const [points, setPoints] = React.useState([{}]);
    const [name, setName] = React.useState('');

    const profileId = match.params.id;
    const emptyProfile = {name: '', points: [{}]};
    const profile = getProfile(profileId) || emptyProfile;
    const profileData = {name: name, points: points};
    useEffect(() => {
        loadProfile(profileId);
    }, []);
    useEffect(() => {
        setName(profile.name)
    }, [loading]);
    return(
        <div className={classes.container}>
            <Grid container spacing={3}>
                <Grid item lg={10}>
                    <h1><KeyboardBackspaceIcon className={classes.backIcon} onClick={history.goBack} />Profile List</h1>
                </Grid>
                <Grid item lg={2}>
                    <Button variant="contained" color="secondary" className={classes.saveButton} onClick={async ()=>{
                        if(name == "") {
                            alert("Type the Profile Name!")
                        }
                        else {
                            profileId ? await updateProfile({
                                ...profile,
                                ...profileData
                            }) : await createProfile(profileData)
                        }
                    }}>
                        <SaveIcon />
                        <span>Save Profile</span>
                    </Button>
                </Grid>
            </Grid>
            <Grid container spacing={3} className={classes.gridRoot}>
                <Grid item className={classes.space} />
                <Grid item lg={5} className={classes.root}>
                    <h2>Drawing Settings:</h2>
                    <Divider />
                    {loading ? <div>Loading...</div> : (
                        <div>
                            <Grid container spacing={3} className={classes.gridRoot}>
                                <Grid item lg={12} className={classes.root}>
                                    <TextField
                                        id="profile-name"
                                        label="Profile Name"
                                        margin="normal"
                                        variant="outlined"
                                        className={classes.textField}
                                        value={name}
                                        onChange={(e)=>setName(e.target.value)}
                                    />
                                </Grid>
                            </Grid>
                            <Grid container className={classes.gridRoot}>
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Point No</th>
                                            <th>Length</th>
                                            <th>Angle</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        { pointInfo.length > 1 ? pointInfo.map(data =>
                                            <tr key={data.pointNo}>
                                                <td>{data.pointNo}</td>
                                                <td>
                                                    <InputBase
                                                        type="number"
                                                        className={classes.inputPoint}
                                                        inputProps={{ 'aria-label': 'naked' }}
                                                        value={data.length}
                                                        onChange={(e) => {
                                                            setPointInfo(pointInfo.map(pt => pt.pointNo !== data.pointNo ? pt : ({
                                                                ...pt,
                                                                length: Math.round(e.target.value)
                                                            })))
                                                        }}
                                                        onBlur={() => {
                                                            canvasRef.current.changePoint(data.length, data.pointNo, 'length')
                                                        }}
                                                        onKeyDown={(e) => {
                                                            if(e.keyCode == "13") {
                                                                canvasRef.current.changePoint(data.length, data.pointNo, 'length')
                                                            }
                                                        }}
                                                    />
                                                </td>
                                                <td>
                                                    <InputBase
                                                        type="number"
                                                        className={classes.inputPoint}
                                                        inputProps={{ 'aria-label': 'naked' }}
                                                        value={data.angle > 180 ? (data.angle - 360).toFixed(1) : data.angle}
                                                        onChange={(e) => {
                                                            if(data.pointNo !== 0)
                                                            {
                                                                setPointInfo(pointInfo.map(pt => pt.pointNo !== data.pointNo ? pt : ({
                                                                    ...pt,
                                                                    angle: Math.round(e.target.value)
                                                                })))
                                                            }
                                                        }}
                                                        onBlur={() => {
                                                            canvasRef.current.changePoint(data.angle, data.pointNo, 'angle')
                                                        }}
                                                        onKeyDown={(e) => {
                                                            if(e.keyCode == "13") {
                                                                canvasRef.current.changePoint(data.angle, data.pointNo, 'angle')
                                                            }
                                                        }}
                                                    />
                                                </td>
                                            </tr>
                                        ) : <tr>
                                                <td>-</td>
                                                <td>-</td>
                                                <td>-</td>
                                            </tr>
                                        }
                                    </tbody>
                                </table>
                            </Grid>
                        </div>    
                    )}
                </Grid>
                <Grid item className={classes.space} />
                <Grid item lg={6} xs={12} className={classes.root}>
                    <h2>Drawing Panel:</h2>
                    <Divider />
                    <div className={classes.canvasContainer}>
                        <Grid container spacing={3} className={classes.gridRoot}>
                            <Grid item lg={12}>
                                {loading ? <div>Loading...</div> :
                                    <CanvasComponent 
                                        className={classes.canvas}
                                        ref={canvasRef}
                                        isMobile={isMobOrTab}
                                        points={profile.points}
                                        getPointInfo={_pointInfo => setPointInfo([..._pointInfo])}
                                        getPoints={_point => setPoints([..._point])}
                                    />
                                }
                            </Grid>
                        </Grid>
                    </div>
                </Grid>
            </Grid>
        </div>
    )
}

const mapStateToProps = state => ({
    getProfile(id) {
        return profileSelector(id)(state)
    },
    loading: isLoading(loadProfile)(state)
});

const mapDispatchToProps = {
    createProfile,
    loadProfile,
    updateProfile
};
export default connect(mapStateToProps, mapDispatchToProps)(withRouter(Drawer));