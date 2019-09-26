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


class WarehouseCheckout extends Component {
  constructor() {
    super()
    this.state = {
      barcode: '',
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
            text: "移出失敗",
            buttonText: "OK"
            })  
        }
    })
  }

  onSearch(barcode) {
    if (barcode) {
      console.log(`barcode: ${barcode}`)
      apiFetch(GET_SHELF_INFO, { token: barcode, with_warehouse: true }, data => {
        console.log(data)
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
          console.log(this.state.shelves)
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
          <Right>
            <Button
              transparent
              onPress={() =>
                this.props.navigation.navigate("BarcodeScanner", {
                  onBarcodeScanned: (barcode) => {
                    console.log(`SCAN callback ${barcode}`)
                    this.setState({ barcode: barcode })
                    this.onSearch(barcode)
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
              this.state.shelves.map((shelf) => <ListItem>
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
