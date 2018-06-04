import React, { Component } from "react";
import {
  Container,
  Header,
  Title,
  Content,
  Button,
  Icon,
  Body,
  Left,
  Right,
  Input,
  Item,
  Form,
  List,
  ListItem,
  Text,
  Toast
} from "native-base";

import {Keyboard} from 'react-native'
import styles from "./styles"
import { apiFetch, GET_SHELF_INFO } from "../../api"

import ShelfShow from './show'
import { normalize_shelf_barcode } from '../../sdj_common'

class ShelfSearch extends Component {
  constructor() {
    super()
    this.state = {
      barcode: ''
    }
  }
  render() {
    let rows = []
    return (
      <Container style={styles.container}>
        <Header searchBar rounded>
        <Left>
          <Button
            transparent
            onPress={() => {
              Keyboard.dismiss()
              this.props.navigation.navigate("DrawerOpen")}
            }
          >
            <Icon name="menu" />
          </Button>
        </Left>
          <Item>
            <Input placeholder="Search" placeholder="請輸入或者掃描條碼"
              keyboardType='numeric'
              returnKeyType="done"
              value={this.state.barcode}
              onChangeText={(text) => this.setState({ barcode: normalize_shelf_barcode(text.toUpperCase())})}
              autoFocus={true} onEndEditing={
              (event) => {
                apiFetch(GET_SHELF_INFO, { token: this.state.barcode},data => {
                  if(data){
                    this.props.navigation.navigate("ShelfShow",data)
                  }else{
                    Toast.show({
                      text: "查無此儲位",
                      buttonText: "OK"
                    })
                  }
                })
              }
            } />
          </Item>
        </Header>
        <Content>
        </Content>
      </Container>
    );
  }
}

export default ShelfSearch;
