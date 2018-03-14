
import { combineReducers } from 'redux';
import SET_AUTH_TOKEN from "../actions/action_types"

const initialState = {
  auth_token: ''
};
 

const appReducer = (state = initialState, action)=>{
  switch(action.type){
    case SET_AUTH_TOKEN:
      console.log(action)
      return Object.assign({}, state,{auth_token : action.auth_token})
    default:
      return state;
  }
}
export default appReducer;