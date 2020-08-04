import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux';
import appReducer from '../actions/app';
import profileReducer from '../actions/profile';
import loadingReducer from '../actions/loading';

export const rootReducer = asyncReducers => {
  const reducers = {
    router: routerReducer,
    app: appReducer,
    profiles: profileReducer,
    loading: loadingReducer,
    ...asyncReducers
  };
  return combineReducers(reducers);
};

export default rootReducer;