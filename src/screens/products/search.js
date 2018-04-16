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
  Text
} from "native-base";

import {Keyboard} from 'react-native'
import styles from "./styles"
import { apiFetch, GET_PRODUCTS } from "../../api"
import ProductStorages from './storages'

class ProductSearch extends Component {
  constructor() {
    super()
    this.state = {
      products: []
    }
  }
  render() {
    let rows = []
    rows = this.state.products.map(product => {
      return <ListItem key={product.id} button onPress={() =>
        this.props.navigation.navigate("ProductStorages",product.storages)
      }>
        <Left>
          <Text>
            {product.name}
          </Text>
        </Left>
        <Right>
          <Icon name="arrow-forward" style={{ color: "#999" }} />
        </Right>
      </ListItem>
    })
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
            <Input placeholder="Search" placeholder="請輸入或者掃描條碼" autoFocus={true} onEndEditing={
              (event) => {
                let barcode = event.nativeEvent.text
                if(barcode){
                  apiFetch(GET_PRODUCTS, { barcode: barcode }).then(data => {
                    console.log(data)
                    this.setState({ products: data })
                  })  
                }else{
                  this.setState({ products: [] })
                }
              }
            } />
          </Item>
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
