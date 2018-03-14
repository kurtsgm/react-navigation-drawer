import React from "react";
import Setup from "./src/boot/setup";

import {Provider} from 'react-redux'
import { createStore } from 'redux';
import AppReducer from './src/redux/reducers/AppReducer'
 
const store = createStore(AppReducer)


export default class App extends React.Component {
  render() {
    return <Provider store={store}>
         <Setup /> 
         </Provider>;
  }
}
