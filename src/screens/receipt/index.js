

import React, { Component } from "react";
import { bindActionCreators } from 'redux'
import { H1,Container, Button, H3, View,Text ,Form, Item, Label ,Input ,Content } from "native-base";
import * as AppActions from 'redux/actions/AppAction'

import styles from "./styles";


class Receipt extends Component {
  constructor(props){
    super(props)
    this.state = {

    }
    this.login = this.login.bind(this)
  }
}