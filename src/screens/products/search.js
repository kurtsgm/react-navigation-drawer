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
import { apiFetch, GET_PRODUCTS } from "../../api"
import ProductStorages from './storages'

class ProductSearch extends Component {
  constructor() {
    super()
    this.state = {
      products: []
    }
    this.onSearch = this.onSearch.bind(this)
  }
  onSearch(barcode) {
    if (barcode) {
      apiFetch(GET_PRODUCTS, { barcode: barcode }, data => {
        if (data.length == 0) {
          Toast.show({
            text: "查無此商品",
            buttonText: "OK"
          })
        }
        this.setState({ products: data, barcode: '' })

      })
    } else {
      this.setState({ products: [] })
    }
  }
  render() {
    let rows = []
    let previous_shop = null

    for(let product of this.state.products.sort((a,b)=>a.shop_id - b.shop_id)){
      if (previous_shop != product.shop_id) {
        rows.push(<ListItem itemDivider key={`divider-${product.shop_id}`}>
          <Text>{product.shop_name}</Text>
        </ListItem>)
        previous_shop = product.shop_id
      }       
      rows.push(<ListItem key={product.id} button onPress={() =>
        this.props.navigation.navigate("ProductStorages",{product: product, storages: product.storages})
      }>
        <Left>
          <Text>
            {
              `${product.name}\n${product.uid}`
            }
          </Text>
        </Left>
        <Body>
          <Text>
            {
              product.barcode
            }
          </Text>
        </Body>
        <Right>
          <Icon name="arrow-forward" style={{ color: "#999" }} />
        </Right>
      </ListItem>)
    }
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
            <Input placeholder="請輸入或者掃描條碼" autoFocus={true}
              value={this.state.barcode}
              onFocus={() => this.setState({ barcode: null })}
              onChangeText={(text) => this.setState({ barcode: text })}
              onEndEditing={
                (event) => {
                  let barcode = event.nativeEvent.text.trim()
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
        <Content>
          {
            this.state.products.length > 0 ?
              <List>
                {rows}
              </List> : null
          }
        </Content>
      </Container>
    );
  }
}

export default ProductSearch;
