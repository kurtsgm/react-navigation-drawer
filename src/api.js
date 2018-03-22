import Expo from "expo";

import * as AppActions from './redux/actions/AppAction'
import {store} from './redux/stores/store'

const { manifest } = Expo.Constants;

export const API_OAUTH = "OAUTH"
export const GET_RECEIPTS = "GET_RECEIPTS"
export const RECEIVE_RECEIPT = "RECEIVE_RECEIPT"
export const RECOMMEND_SHELF = "RECOMMEND_SHELF"


const Actions = {
  OAUTH: {path: "/oauth/token",method: "POST"},
  GET_RECEIPTS: {path: '/api/v1/receipts',method: "GET"},
  RECEIVE_RECEIPT: {path: '/api/v1/receipts/{id}/receive', method: "POST"},
  RECOMMEND_SHELF: {path: '/api/v1/receipts/{id}/recommend', method: "POST"}
}


export function apiFetch(action,data){      
  let host
  if(__DEV__){
    host = "http://"+manifest.debuggerHost.split(":").shift().concat(":3000")
  }else{
    host = "TODO"
  }
  let _action = Actions[action]
  let path = _action.path
  Object.keys(data).forEach(key=>{path=path.replace(`{${key}}`,data[key])})
  let url = host + path
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
  console.log(options)
  return fetch(url, options).then((response)=>{
    return response.json();
  })
  
}




