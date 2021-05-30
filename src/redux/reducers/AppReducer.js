
import { combineReducers } from 'redux';
import {SET_AUTH_TOKEN, SET_SHELVES,LOADING_START,LOADING_END,CABLE_CONSUMER} from "../actions/action_types"

const initialState = {
  auth_token: null,
  role: null,
  loading: false,
};
 

const appReducer = (state = initialState, action)=>{
  switch(action.type){
    case SET_AUTH_TOKEN:
      return Object.assign({}, state,{auth_token : action.auth_token,role:action.role,username: action.username})
    case SET_SHELVES:
      return Object.assign({}, state,{shelves : action.shelves})
    case LOADING_START:
      return Object.assign({}, state,{loading: true})
    case LOADING_END:
      return Object.assign({}, state,{loading: false})
    case CABLE_CONSUMER:
      console.log("CONSMER!")
      return Object.assign({}, state,{consumer : action.consumer})
    default:
      return state;
  }
}


export default appReducer;