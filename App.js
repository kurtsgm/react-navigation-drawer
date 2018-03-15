import React from "react";
import Setup from "./src/boot/setup";
import {Provider} from 'react-redux'
import {store} from "./src/redux/stores/store"

export default class App extends React.Component {
  render() {
    return <Provider store={store}>
         <Setup /> 
         </Provider>;
  }
}
