import {
  SET_AUTH_TOKEN,
  SET_SHELVES,
  LOADING_START,
  LOADING_END
} from './action_types'


export const setToken = (token,role) => {
  return {
    type: SET_AUTH_TOKEN,
    role: role,
    auth_token: token
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