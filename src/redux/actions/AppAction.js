import {
  SET_AUTH_TOKEN,
  SET_SHELVES
} from './action_types'


export const setToken = (token) => {
  return {
    type: SET_AUTH_TOKEN,
    auth_token: token
  }
}

export const setShelves = (shelves)=>{
  return {
    type: SET_SHELVES,
    shelves: shelves
  }
}