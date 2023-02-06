import {
  SET_AUTH_TOKEN,
  SET_SHELVES,
  LOADING_START,
  LOADING_END,
  CABLE_CONSUMER,
  SET_WAREHOUSE
} from './action_types'


export const setToken = (token,role,username) => {
  return {
    type: SET_AUTH_TOKEN,
    username: username,
    role: role,
    auth_token: token
  }
}

export const setWarehouse = (warehouse) => {
  if(!warehouse.layer_digits){
    warehouse.layer_digits = 1
  }
  if(!warehouse.column_digits){
    warehouse.column_digits = 2
  }
  if(!warehouse.row_digits){
    warehouse.row_digits = 2
  }
  return {
    type: SET_WAREHOUSE,
    warehouse: warehouse
  }
}

export const setConsumer = (consumer) => {
  return {
    type: CABLE_CONSUMER,
    consumer: consumer
  }
}


export const setShelves = (shelves)=>{
  return {
    type: SET_SHELVES,
    shelves: shelves
  }
}

export const onLoadingStart = ()=>{
  return {
    type: LOADING_START
  }
}

export const onLoadingEnd = ()=>{
  return {
    type: LOADING_END
  }
}