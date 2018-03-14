import {SET_AUTH_TOKEN} from './action_types'

export const setToken = (token) => {
  return {
    type: SET_AUTH_TOKEN,
    auth_token: token
  }
}
