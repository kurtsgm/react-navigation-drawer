
import { combineReducers } from 'redux';
import {SET_AUTH_TOKEN, SET_SHELVES,LOADING_START,LOADING_END} from "../actions/action_types"

const initialState = {
  auth_token: null,
  loading: false,
};
 

const appReducer = (state = initialState, action)=>{
  console.log(action)
  switch(action.type){
    case SET_AUTH_TOKEN:
      return Object.assign({}, state,{auth_token : action.auth_token})
    case SET_SHELVES:
      return Object.assign({}, state,{shelves : action.shelves})
    case LOADING_START:
      console.log('yoyo dispatch')
      return Object.assign({}, state,{loading: true})
    case LOADING_END:
      return Object.assign({}, state,{loading: false})
    default:
      return state;
  }
}


export default appReducer;