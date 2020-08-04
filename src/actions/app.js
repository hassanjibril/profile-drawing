import { createAction, handleActions } from 'redux-actions'
import { push } from 'react-router-redux'
import { ROUTER_PUSH } from './actions';

// ==================================
// Actions
// ==================================
export const routerPush = createAction(ROUTER_PUSH, path => dispatch => {
  dispatch(push(path))
})

// ==================================
// Action Handlers
// ==================================
const ACTION_HANDLERS = {}

// ==================================
// Reducer
// ==================================

const initialState = {
}

export default handleActions(ACTION_HANDLERS, initialState)