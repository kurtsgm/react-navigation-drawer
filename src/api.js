import Expo from "expo";

import * as AppActions from './redux/actions/AppAction'
import {store} from './redux/stores/store'

const { manifest } = Expo.Constants;

export const API_OAUTH = "OAUTH"
export const GET_RECEIPTS = "GET_RECEIPTS"

const Actions = {
  OAUTH: {path: "/oauth/token",method: "POST"},
  GET_RECEIPTS: {path: '/api/v1/receipts',method: "GET"}
}


export function apiFetch(action,data){      
  let host
  if(__DEV__){
    host = "http://"+manifest.debuggerHost.split(":").shift().concat(":3000")
  }else{
    host = "TODO"
  }
  let _action = Actions[action]
  let url = host + _action.path
  let options = {
    method:  _action.method,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'Authorization': 'Bearer '+store.getState().auth_token
    }
  }
  if (_action.method == "GET"){
    params= "?"+Object.entries(data).map(item=>item[0]+"="+item[1]).join("&")
    url+=params
  }else{
    options.body = JSON.stringify(
      data
    )
  }
  return fetch(url, options).then((response)=>{
    return response.json();
  })
  
}



