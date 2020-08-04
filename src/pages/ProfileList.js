import React, { useEffect } from 'react';
import { withRouter } from "react-router";
import { connect } from 'react-redux';

import { isLoading } from '../actions/loading';
import { loadProfiles, profileListSelector, deleteProfile } from '../actions/profile';

import { fade, makeStyles } from "@material-ui/core/styles";
import {
    InputBase,
    Grid,
    List,
    ListItem,
    ListItemText,
    Divider,
    Button
  } from "@material-ui/core";

import SearchIcon from "@material-ui/icons/Search";
import NoteAddIcon from '@material-ui/icons/NoteAdd';
import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/Edit';

const useStyles = makeStyles(theme => ({
    container: {
        flex: 1
    },
    search: {
        position: "relative",
        borderRadius: theme.shape.borderRadius,
        backgroundColor: fade(theme.palette.common.white, 0.15),
        "&:hover": {
            backgroundColor: fade(theme.palette.common.white, 0.25)
        },
        marginTop: theme.spacing(2),
        marginRight: theme.spacing(2),
        marginLeft: 0,
        padding: theme.spacing(1),
        width: "100%"
    },
    searchIcon: {
        width: theme.spacing(7),
        height: "100%",
        position: "absolute",
        top: theme.spacing(0),
        pointerEvents: "none",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
    },
    inputRoot: {
        color: "inherit"
    },
    inputInput: {
        backgroundColor: "transparent",
        color: "white",
        fontSize: "1rem",
        padding: theme.spacing(1, 1, 1, 7),
        width: "100%",
    },
    createButton: {
        margin: theme.spacing(2),
        padding: theme.spacing(1.5),
        marginRight: theme.spacing(7),
        float: "right"
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
    deleteButton: {
        margin: theme.spacing(1.5),
        float: "right",
        backgroundColor: "red"
    },
    editButton: {
        margin: theme.spacing(1.5),
        float: "right",
        backgroundColor: "green"
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
    profileImage: {
        width: "100%",
        height: "100%"
    },
    profileName: {
        borderBottom: "1px solid #e0e0e0"
    }
}));

function ProfileList({
    profileList,
    loadProfiles,
    loading,
    history
}) {
    useEffect(() => {
        loadProfiles();
    }, []);
    
    const emptyProfile = [{name: '', points: [{}]}];
    const classes = useStyles();
    const [selectedIndex, setSelectedIndex] = React.useState(0);
    const [filteredProfileList, setfilteredProfileList] = React.useState(emptyProfile);
    const handleListItemClick = (event, index) => {
        setSelectedIndex(index);
    }
    useEffect(() => {
        setfilteredProfileList(profileList)
    }, [profileList]);

    const search = (e) => {
        var filteredProfileIndexList = [];
        var filteredProfile = [];
        profileList.map((profile, index) => {
            if(profile.name.toLowerCase().indexOf(e.target.value.toLowerCase()) != -1) {
                filteredProfileIndexList.push(index);
            }
        })
        filteredProfileIndexList.map(filteredProfileIndex=>{
            filteredProfile.push(profileList[filteredProfileIndex])
        })
        setfilteredProfileList(filteredProfile);
    }
    return(
        <div className={classes.container}>
            <Grid container spacing={3}>
                <Grid item lg={2} xs={12}>
                    <h1>Profile List</h1>
                </Grid>
                <Grid item lg={8} xs={12}>
                    <div className={classes.search}>
                        <div className={classes.searchIcon}>
                            <SearchIcon />
                        </div>
                        <InputBase
                            placeholder="Search…"
                            fullWidth
                            classes={{
                                root: classes.inputRoot,
                                input: classes.inputInput
                            }}
                            inputProps={{ "aria-label": "Search" }}
                            onChange={(e)=>search(e)}
                        />
                    </div>
                </Grid>
                <Grid item lg={2} xs={12}>
                    <Button variant="contained" color="secondary" className={classes.createButton} onClick={()=>history.push("/drawer")}>
                        <NoteAddIcon />
                        <span>Create New</span>
                    </Button>
                </Grid>
            </Grid>
            <Grid container spacing={3} className={classes.gridRoot}>
                <Grid item className={classes.space} />
                <Grid item lg={5} className={classes.root}>
                    <h2>Profile Lists:</h2>
                    <Divider />
                    <List component="nav">
                        {loading ? <div>Loading...</div> :
                            filteredProfileList.map((profile, index) =>
                                <ListItem
                                    key={index}
                                    className={classes.profileName}
                                    selected={selectedIndex === index}
                                    onClick={event => handleListItemClick(event, index)}
                                >
                                    <ListItemText primary={profile.name} />
                                </ListItem>
                            )
                        }
                    </List>
                </Grid>
                <Grid item className={classes.space} />
                <Grid item lg={6} className={classes.root}>
                    <Grid container spacing={3} className={classes.gridRoot}>
                        <Grid item lg={3}>
                            <h2>Profile Detail:</h2>
                        </Grid>
                        <Grid item lg={9}>
                            <Button variant="contained" color="primary" className={classes.deleteButton} onClick={async ()=>{
                                await deleteProfile(filteredProfileList[selectedIndex].id);
                                // await loadProfiles();
                                setfilteredProfileList(filteredProfileList.filter(profile=>profile.id !== filteredProfileList[selectedIndex].id))
                                setSelectedIndex(0);
                            }}>
                                <DeleteIcon />
                                <span>Delete</span>
                            </Button>
                            <Button variant="contained" color="primary" className={classes.editButton} onClick={()=>history.push(`/drawer/${filteredProfileList[selectedIndex].id}`)}>
                                <EditIcon />
                                <span>Edit</span>
                            </Button>
                        </Grid>
                    </Grid>
                    <Divider />
                    {loading ? (
                        <div>Loading...</div>
                    ) : (
                        <div className={classes.static}>
                            <span className={classes.title}>Profile Name</span>
                            <p className={classes.content}>{filteredProfileList[selectedIndex] ? filteredProfileList[selectedIndex].name : ''}</p>
                        </div>
                    )}
                    <Grid container spacing={3} className={classes.gridRoot}>
                        <Grid item lg={6}>
                            <div className={classes.static}>
                                <span className={classes.title}>Material</span>
                                <p className={classes.content}>Steel</p>
                            </div>
                        </Grid>
                        <Grid item lg={6}>
                            <div className={classes.static}>
                                <span className={classes.title}>Material thickness</span>
                                <p className={classes.content}>0,05 mm</p>
                            </div>
                        </Grid>
                    </Grid>
                    <Grid container spacing={3} className={classes.gridRoot}>
                        <Grid item lg={6}>
                            <div className={classes.static}>
                                <span className={classes.title}>Profile length</span>
                                <p className={classes.content}>0 mm</p>
                            </div>
                        </Grid>
                        <Grid item lg={6}>
                            <div className={classes.static}>
                                <span className={classes.title}>Flat sheet size</span>
                                <p className={classes.content}>0 mm2</p>
                            </div>
                        </Grid>
                    </Grid>
                    <Grid container spacing={3} className={classes.gridRoot}>
                        <Grid item lg={6}>
                            <div className={classes.static}>
                                <span className={classes.title}>Angle correction</span>
                                <p className={classes.content}>0 mm</p>
                            </div>
                        </Grid>
                        <Grid item lg={6}>
                            <div className={classes.static}>
                                <span className={classes.title}>Number of pieces</span>
                                <p className={classes.content}>0</p>
                            </div>
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
        </div>
    )
}

const mapStateToProps = state => ({
    profileList: profileListSelector(state),
    loading: isLoading(loadProfiles)(state),
});

const mapDispatchToProps = {
    loadProfiles
};

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(ProfileList));