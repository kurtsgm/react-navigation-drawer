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
import { apiFetch, GET_SHELF_INFO ,CHECKOUT_SHELF } from "../../api"
import { View } from 'react-native'
import {normalize_shelf_barcode} from '../../common'


class WarehouseCheckout extends Component {
  constructor() {
    super()
    this.state = {
      shelves: [],
    }
    this.submit = this.submit.bind(this)
    this.onRemove = this.onRemove.bind(this)
    this.onSearch = this.onSearch.bind(this)
  }
  onRemove(id) {
    let shelves = this.state.shelves.filter(shelf => shelf.id != id)
    this.setState({ shelves: shelves })
  }

  submit() {
    apiFetch(CHECKOUT_SHELF, { 
      shelves: this.state.shelves.map(shelf=>shelf.id)
     }, data => {
       if(data.success){
         this.setState({shelves:[]})
         Toast.show({
          text: "已成功登記移出並鎖定儲位",
          buttonText: "OK"
          })
        }else{
          Toast.show({
            text: `移出失敗\n${data.message}`,
            buttonText: "OK"
            })  
        }
    })
  }

  onSearch(barcode) {
    if (barcode) {
      apiFetch(GET_SHELF_INFO, { token: barcode }, data => {
        if (data) {
          let shelves = this.state.shelves
          let collected_ids = this.state.shelves.map(shelf => shelf.id)
          if (collected_ids.indexOf(data.id) < 0) {
            shelves.push({
              id: data.id,
              token: data.token,
              warehouse: data.warehouse
            })
            shelves = shelves
            this.setState({ shelves: shelves })
          }
        } else {
          Toast.show({
            text: `查無儲位${barcode}或已鎖定`,
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
                    this.onSearch(normalize_shelf_barcode(barcode) )
                  }
                }
                )
              }
            >
              <Icon name="camera" />
            </Button>
          </Right>

        </Header>
        <Content padder>
          <List>
            {
              this.state.shelves.map((shelf) => <ListItem key={shelf.id}>
                <Left>
                  <Button
                    transparent
                    onPress={() => {
                      this.onRemove(shelf.id)
                    }
                    }
                  >
                    <Icon name="remove-circle" style={{ color: 'red' }} />
                  </Button>
                </Left>
                <Body>
                  <Text>{shelf.warehouse.title}</Text>
                </Body>
                <Body>
                  <Text>{shelf.token}</Text>
                </Body>

              </ListItem>)
            }
          </List>

        </Content>
        <View style={styles.footer}>
          {this.state.shelves.length > 0 ?
            <Button primary full style={[styles.mb15, styles.footer]} onPress={() => {
              this.submit()
            }}>
              <Text>確認</Text>
            </Button> : null
          }
        </View>

      </Container>
    );
  }
}

export default WarehouseCheckout;
