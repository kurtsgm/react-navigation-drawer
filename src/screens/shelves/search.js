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

import { Keyboard } from 'react-native'
import styles from "./styles"
import { apiFetch, GET_SHELF_INFO } from "../../api"

import ShelfShow from './show'
import { normalize_shelf_barcode } from '../../common'

class ShelfSearch extends Component {
  constructor() {
    super()
    this.state = {
      barcode: ''
    }
    this.onSearch = this.onSearch.bind(this)
  }

  onSearch(barcode){
    if (barcode) {
      apiFetch(GET_SHELF_INFO, { token: barcode }, data => {
        if (data) {
          this.props.navigation.navigate("ShelfShow", data)
        } else {
          Toast.show({
            text: "查無此儲位或已鎖定",
            buttonText: "OK"
          })
        }
      })
    }

  }
  render() {
    return (
      <Container style={styles.container}>
        <Header searchBar rounded>
          <Left>
            <Button
              transparent
              onPress={() => {
                Keyboard.dismiss()
                this.props.navigation.openDrawer()
              }
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
              onChangeText={(text) => this.setState({ barcode: normalize_shelf_barcode(text.toUpperCase()) })}
              onFocus={()=>this.setState({ barcode:null})}
              autoFocus={true}
              onEndEditing={
                (event) => {
                  let barcode = normalize_shelf_barcode(event.nativeEvent.text.trim())
                  this.onSearch(barcode)
                }
              } />
          </Item>
          <Right>
            <Button
              transparent
              onPress={() =>
                this.props.navigation.navigate("BarcodeScanner", {
                  onBarcodeScanned: (barcode) => {
                    let _barcode = normalize_shelf_barcode(barcode)
                    this.setState({ barcode: _barcode})
                    this.onSearch(_barcode)
                  }
                }
                )
              }
            >
              <Icon name="camera" />
            </Button>
          </Right>

        </Header>
        <Content>
        </Content>
      </Container>
    );
  }
}

export default ShelfSearch;
