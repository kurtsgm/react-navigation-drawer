import Expo from "expo";

import * as AppActions from './redux/actions/AppAction'
import {store} from './redux/stores/store'

const { manifest } = Expo.Constants;

export const API_OAUTH = "OAUTH"
export const GET_RECEIPTS = "GET_RECEIPTS"
export const RECEIVE_RECEIPT = "RECEIVE_RECEIPT"
export const RECOMMEND_SHELF = "RECOMMEND_SHELF"
export const GET_SHELVES = "GET_SHELVES"
export const GET_RECEIPT = "GET_RECEIPT"
export const GET_PRODUCTS = "GET_PRODUCTS"
export const GET_SHELF_INFO = "GET_SHELF_INFO"
export const ADJUST_SHELF_QUANTITY = "ADJUST_SHELF_QUANTITY"

export const GET_PICKING_LISTS = 'GET_PICKING_LISTS'
export const MERGE_SHELVES = 'MERGE_SHELVES'
export const CONFIRM_PICKING = 'CONFIRM_PICKING'


const Actions = {
  OAUTH: {path: "/oauth/token",method: "POST"},
  GET_RECEIPTS: {path: '/api/v1/receipts',method: "GET"},
  GET_RECEIPT: {path: '/api/v1/receipts/{id}', method: "GET"},
  RECEIVE_RECEIPT: {path: '/api/v1/receipts/{id}/receive', method: "POST"},
  RECOMMEND_SHELF: {path: '/api/v1/receipts/{id}/recommend', method: "POST"},
  GET_SHELVES: {path: '/api/v1/shelves/', method: "GET"},
  GET_PRODUCTS: {path: '/api/v1/products/{barcode}', method: "GET"},
  GET_SHELF_INFO: {path: '/api/v1/shelves/{token}', method: "GET"},
  GET_PICKING_LISTS: {path: '/api/v1/picking_lists/', method: "GET"},
  CONFIRM_PICKING: {path: '/api/v1/picking_lists/{id}/pick', method: "POST"},
  MERGE_SHELVES: {path:'/api/v1/shelves/merge', method: "POST"},
  ADJUST_SHELF_QUANTITY: {path: '/api/v1/shelves/{token}/adjust',method: "POST"} 
}


export function apiFetch(action,data={}){      
  let host
  if(__DEV__){
    host = "http://"+manifest.debuggerHost.split(":").shift().concat(":3000/")
  }else{
    host = "TODO"
  }
  let _action = Actions[action]
  let path = _action.path
  Object.keys(data).forEach(key=>{
    if(path.match(`{${key}}`)){
      path=path.replace(`{${key}}`,data[key])
      delete data[key]
    }
  })
  let url = host + path
  let options = {
    method:  _action.method,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'Authorization': 'Bearer '+store.getState().auth_token
    }
  }
  if (_action.method == "GET" && data){
    params= "?"+Object.entries(data).map(item=>item[0]+"="+item[1]).join("&")
    url+=params
  }else{
    options.body = JSON.stringify(
      data
    )
  }
  console.log(url)
  return fetch(url, options).then((response)=>{
    return response.json();
  })
  
}




