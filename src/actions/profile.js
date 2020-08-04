import { createAction, handleActions } from 'redux-actions'
import { createSelector } from 'reselect';
import { API } from 'aws-amplify';
import uuid from 'uuid/v4';
import { LOAD_PROFILES, LOAD_PROFILE, ADD_PROFILE, UPDATE_PROFILE, DELETE_PROFILE } from './actions';
import { fulfilled } from '../helpers';

let apiName = 'profileAPI'
let path = '/profiles'

// ==================================
// Selectors
// ==================================
export const profileListSelector = createSelector(
    state => state.profiles,
    profiles => profiles.list
);

export const profileSelector = id => createSelector(
    state => state.profiles,
    profiles => profiles.list.find(profile => profile.id === id)
);

// ==================================
// Actions
// ==================================
export const loadProfiles = createAction(LOAD_PROFILES, () => {
    return API.get(apiName, path);
});

export const loadProfile = createAction(LOAD_PROFILE, id => {
    return API.get(apiName, `${path + '/' + id}`);
});

export const createProfile = createAction(ADD_PROFILE, profileData => {
    return API.post(apiName, path, {
        body: {
            id: uuid(),
            ...profileData
        }
    });
});

export const deleteProfile = createAction(DELETE_PROFILE, id => {
    return API.del(apiName, `${path + '/object/' + id}`);
});

export const updateProfile = createAction(UPDATE_PROFILE, profileData => {
    return API.put(apiName, path, {
        body: profileData
    });
});

// ==================================
// Action Handlers
// ==================================
const ACTION_HANDLERS = {
    [fulfilled(loadProfiles)]: (state, action) => ({
        ...state,
        list: action.payload
    }),
    [fulfilled(loadProfile)]: (state, action) => ({
        ...state,
        list: action.payload
    })
};

// ==================================
// Reducer
// ==================================
const initialState = {
    list: []
};

export default handleActions(ACTION_HANDLERS, initialState);