
import { combineReducers } from 'redux';
import {SET_AUTH_TOKEN, SET_SHELVES} from "../actions/action_types"

const initialState = {
  auth_token: null
};
 

const appReducer = (state = initialState, action)=>{
  console.log(action)
  switch(action.type){
    case SET_AUTH_TOKEN:
      return Object.assign({}, state,{auth_token : action.auth_token})
    case SET_SHELVES:
      return Object.assign({}, state,{shelves : action.shelves})
    default:
      return state;
  }
}


export default appReducer;