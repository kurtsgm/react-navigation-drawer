import Expo from "expo";
import Constants from 'expo-constants'

import * as AppActions from './redux/actions/AppAction'
import {store} from './redux/stores/store'

// const { manifest } = Expo.Constants;

export const API_OAUTH = "OAUTH"
export const GET_RECEIPTS = "GET_RECEIPTS"
export const GET_RECEIPTS_SHOPS = 'GET_RECEIPTS_SHOPS'
export const GET_RECEIPT_ITEM = 'GET_RECEIPT_ITEM'
export const VERIFY_RECEIPT_ITEM = 'VERIFY_RECEIPT_ITEM'
export const VERIFY_RECEIPT_ALL_ITEM = 'VERIFY_RECEIPT_ALL_ITEM'


export const RECEIVE_RECEIPT = "RECEIVE_RECEIPT"
export const RECOMMEND_SHELF = "RECOMMEND_SHELF"
export const BATCH_SUBMIT_SHELVES = "BATCH_SUBMIT_SHELVES"

export const GET_SHELVES = "GET_SHELVES"
export const GET_RECEIPT = "GET_RECEIPT"
export const GET_PRODUCTS = "GET_PRODUCTS"
export const GET_SHELF_INFO = "GET_SHELF_INFO"
export const CHECKOUT_SHELF = "CHECKOUT_SHELF"
export const ADJUST_SHELF_QUANTITY = "ADJUST_SHELF_QUANTITY"

export const GET_PICKING_LISTS = 'GET_PICKING_LISTS'
export const GET_PICKING_LIST = 'GET_PICKING_LIST'
export const MERGE_SHELVES = 'MERGE_SHELVES'
export const CONFIRM_PICKING = 'CONFIRM_PICKING'
export const GET_HIGH_LAYER = 'GET_HIGH_LAYER'
export const ACTIVATE_PICKING = "ACTIVATE_PICKING"

export const GET_WAREHOUSES = "GET_WAREHOUSES"
export const GET_TRANSFER_SHELVES = 'GET_TRANSFER_SHELVES'

export const GET_SHOP_PRODUCT_STORAGE_TYPES = 'GET_SHOP_PRODUCT_STORAGE_TYPES'

export const GET_SHOPS = "GET_SHOPS"
export const SET_SHOPS = "SET_SHOPS"

// Amphenol
export const AMPHENOL_CREATE_BOX_ID ='AMPHENOL_CREATE_BOX_ID'
export const AMPHENOL_GET_RECEIPTS = 'AMPHENOL_GET_RECEIPTS'
export const AMPHENOL_CREATE_RECEIPT = 'AMPHENOL_CREATE_RECEIPT'
export const AMPHENOL_SHOW_RECEIPT = 'AMPHENOL_SHOW_RECEIPT'
export const AMPHENOL_DONE_RECEIPT = 'AMPHENOL_DONE_RECEIPT'
export const AMPHENOL_RECEIVE_SHELF = 'AMPHENOL_RECEIVE_SHELF'

import {Toast} from 'native-base'

const API_PATH = __DEV__ ? "/api" : ''

const Actions = {
  OAUTH: {path: `/oauth/token`,method: "POST"},
  GET_RECEIPTS: {path: `${API_PATH}/v1/receipts`,method: "GET"},
  GET_RECEIPTS_SHOPS: {path: `${API_PATH}/v1/receipts/shops`,method: "GET"},
  GET_RECEIPT: {path: `${API_PATH}/v1/receipts/{id}`, method: "GET"},
  GET_RECEIPT_ITEM: {path: `${API_PATH}/v1/receipts/{receipt_id}/items/{id}`, method: "GET"},
  VERIFY_RECEIPT_ITEM: {path: `${API_PATH}/v1/receipts/{receipt_id}/items/{id}`, method: "POST"},
  VERIFY_RECEIPT_ALL_ITEM: {path: `${API_PATH}/v1/receipts/{receipt_id}/verify_all`, method: "POST"},
  RECEIVE_RECEIPT: {path: `${API_PATH}/v1/receipts/{id}/receive`, method: "POST"},
  RECOMMEND_SHELF: {path: `${API_PATH}/v1/receipts/{id}/recommend`, method: "POST"},
  BATCH_SUBMIT_SHELVES: {path: `${API_PATH}/v1/receipts/{receipt_id}/items/{id}/shelves`, method: "POST"},
  GET_SHELVES: {path: `${API_PATH}/v1/shelves/`, method: "GET"},
  GET_PRODUCTS: {path: `${API_PATH}/v1/products/{barcode}`, method: "GET"},
  GET_SHELF_INFO: {path: `${API_PATH}/v1/shelves/{token}`, method: "GET"},
  CHECKOUT_SHELF: {path: `${API_PATH}/v1/shelves/checkout`,method: "POST"},
  GET_PICKING_LISTS: {path: `${API_PATH}/v1/picking_lists/`, method: "GET"},
  GET_HIGH_LAYER: {path: `${API_PATH}/v1/shelves/high_layer`, method: "GET"},
  GET_PICKING_LIST: {path: `${API_PATH}/v1/picking_lists/{id}`, method: "GET"},
  CONFIRM_PICKING: {path: `${API_PATH}/v1/picking_lists/{id}/pick`, method: "POST"},
  MERGE_SHELVES: {path:`${API_PATH}/v1/shelves/merge`, method: "POST"},
  ADJUST_SHELF_QUANTITY: {path: `${API_PATH}/v1/shelves/{token}/adjust`,method: "POST"},
  ACTIVATE_PICKING: {path: `${API_PATH}/v1/picking_lists/{id}/activate`,method: "POST"},
  GET_SHOP_PRODUCT_STORAGE_TYPES: {path: `${API_PATH}/v1/shops/{shop_id}/product_storage_types`,method: "GET"},
  GET_SHOPS: {path:`${API_PATH}/v1/shops`, method: "GET"},
  SET_SHOPS: {path:`${API_PATH}/v1/shops`, method: "POST"},
  GET_WAREHOUSES: {path:`${API_PATH}/v1/warehouses`, method: "GET"},
  GET_TRANSFER_SHELVES: {path:`${API_PATH}/v1/transfer_receipts/today`, method: "GET"},
  
  AMPHENOL_CREATE_BOX_ID:  {path:`${API_PATH}/v1/amphenol/box_id`, method: "POST"},
  AMPHENOL_GET_RECEIPTS:  {path:`${API_PATH}/v1/amphenol/receipts`, method: "GET"},
  AMPHENOL_SHOW_RECEIPT:  {path:`${API_PATH}/v1/amphenol/receipts/{receipt_id}`, method: "GET"},
  AMPHENOL_DONE_RECEIPT:  {path:`${API_PATH}/v1/amphenol/receipts/{receipt_id}/done`, method: "POST"},
  AMPHENOL_CREATE_RECEIPT:  {path:`${API_PATH}/v1/amphenol/receipts`, method: "POST"},
  AMPHENOL_RECEIVE_SHELF:  {path:`${API_PATH}/v1/amphenol/receipts/{receipt_id}/receive_shelf`, method: "POST"},  
}


import { createConsumer } from '@rails/actioncable';
global.addEventListener = () => {};
global.removeEventListener = () => {};

export function actionCableCumsumer(){
  let host
  if(store.getState().consumer){
    console.log('GET CONSUMER')
    return store.getState().consumer    
  }else{
    console.log('NO CONSUMER')
    let consumer
    if(__DEV__ ){
      // host = "http://192.168.1.108:8088"
      host = "ws://"+Constants.manifest.debuggerHost.split(":").shift().concat(":3000")
  
    }else{
      host = "wss://wms-api.ibiza.com.tw"
    }
    consumer =  createConsumer(`${host}/cable?token=${store.getState().auth_token}`)
    store.dispatch(AppActions.setConsumer(consumer))  
    return consumer
  }

}

export function apiFetch(action,data={},callback_function){
  let host
  if(__DEV__ ){
    // host = "http://192.168.1.108:8088"
    host = "http://"+Constants.manifest.debuggerHost.split(":").shift().concat(":3000")

  }else{
    host = "https://wms-api.ibiza.com.tw"
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
  store.dispatch(AppActions.onLoadingStart())
  return fetch(url, options).then((response)=>{
    if(!response.ok){
      throw new Error(`${response.status}`);
    }else{
      return response.json();
    }
  }).then(response=>{
    store.dispatch(AppActions.onLoadingEnd())
    callback_function(response)
  }).catch(function(error) {
    let text
    store.dispatch(AppActions.onLoadingEnd())
    switch(error.message){
      case '401':
        text = '登入(狀態)失敗，請重新嘗試登入'
        break
      case '500':
        text = '發生錯誤，請通報工程人員處理'
        break
      default:
        text = `連線異常，請檢查網路狀態 (狀態${error})`
    }
    Toast.show({
      text: text,
      duration: 2500,
      type: 'danger',
      textStyle: {textAlign: "center"}
    })
  })
}

