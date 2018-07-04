
import React, { Component } from "react";
import { View } from 'react-native';
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
  Toast,
  Label,
  Card,
  CardItem,
  CheckBox
} from "native-base";

import styles from "./styles"
import { apiFetch, GET_SHELVES, GET_SHELF_INFO, MERGE_SHELVES } from "../../api"
import { normalize_shelf_barcode } from '../../sdj_common'
import { Grid, Col } from "react-native-easy-grid";

const INIT_STATE = {
  shelves: [],
  source_shelf: null,
  destination_shelf: null,
  products: []
}

class ShelfMerge extends Component {
  constructor() {
    super()
    this.state = INIT_STATE
    this.onSourceSelected = this.onSourceSelected.bind(this)
    this.toggle_product = this.toggle_product.bind(this)
    this.valid = this.valid.bind(this)
  }

  valid() {
    return this.state.source_shelf && this.state.destination_shelf && this.state.products.filter(p => p.checked).length > 0
  }

  onSourceSelected(token) {
    token = token.trim()
    if(token){
      apiFetch(GET_SHELF_INFO, { token: token }, data => {
        let avaible_shelves = this.state.shelves.filter((shelf) => shelf.shop_id == null || shelf.shop_id == data.shop_id)
        this.setState({
          source_shelf: token,
          products: data.storages.map(shelf_storage => {
            return {
              checked: true,
              id: shelf_storage.id,
              pcs: shelf_storage.pcs,
              product_title: shelf_storage.product_storage.product.name,
              expiration_date: shelf_storage.product_storage.expiration_date
            }
          })
        })
      })
    }
  }

  toggle_product(id) {
    let products = this.state.products
    for (let p of products) {
      if (p.id == id) {
        p.checked = !p.checked
      }
    }
    this.setState({ products: products })

  }

  merge() {
    apiFetch(MERGE_SHELVES, {
      from: this.state.source_shelf,
      to: this.state.destination_shelf,
      shelf_storages: this.state.products.filter(p => p.checked).map(p => p.id)
    }, data => {
      if (data.status == "success") {
        this.reload()
        Toast.show({
          text: "已成功轉移",
          duration: 2500,
          textStyle: { textAlign: "center" }
        })
      } else {
        Toast.show({
          text: data.message,
          duration: 2500,
          textStyle: { textAlign: "center" }
        })

      }
    })
  }


  render() {
    let rows = []
    return (
      <Container style={styles.container}>
        <Header searchBar rounded>
          <Left>
            <Button transparent onPress={() => { this.props.navigation.navigate("DrawerOpen") }}>
              <Icon name="menu" />
            </Button>
          </Left>
          <Body>
            <Title>
              合併／移動儲位
            </Title>
          </Body>
          <Right></Right>
        </Header>
        <Content padder>
          <Card style={styles.mb}>
            <CardItem header bordered>
              <Grid>
                <Col size={4}  >
                  <Input keyboardType='numeric' value={this.state.source_shelf}
                    placeholder='請輸入或掃描'
                    onChangeText={
                      (text) => {
                        console.log(normalize_shelf_barcode(text))
                        this.setState({ source_shelf: normalize_shelf_barcode(text) })
                      }
                    }
                    onEndEditing={(event) => { this.onSourceSelected(normalize_shelf_barcode(event.nativeEvent.text)) }}
                    returnKeyType="done" />
                </Col>
                <Col size={1}>
                  <Label style={styles.arrow}>
                    <Icon  name="md-arrow-round-forward"></Icon>
                  </Label>
                </Col>
                <Col size={4}>
                  <Input keyboardType='numeric' value={this.state.destination_shelf}
                    placeholder='請輸入或掃描'
                    onChangeText={
                      (text) => {
                        this.setState({ destination_shelf: normalize_shelf_barcode(text) })
                      }
                    }
                    returnKeyType="done" />
                </Col>
              </Grid>
            </CardItem>
          </Card>
          <List>
            {
              this.state.products.map(product => {
                return <ListItem key={product.id}
                  onPress={() => {
                    this.toggle_product(product.id)
                  }}

                >
                  <Left>
                    <CheckBox checked={product.checked} onPress={() => {
                      this.toggle_product(product.id)
                    }
                    } />

                  </Left>
                  <Body>
                    <Text>
                      {product.product_title} {product.expiration_date}
                    </Text>

                  </Body>
                  <Right>
                    <Text>
                      {product.pcs}
                    </Text>
                  </Right>
                </ListItem>

              })
            }
          </List>

        </Content>
        <View style={styles.footer}>
          {this.valid() ?
            <Button primary full style={[styles.mb15, styles.footer]} onPress={() => {
              this.merge()
            }}>
              <Text>確認移入</Text>
            </Button> : null
          }
        </View>
      </Container>
    );
  }
}

export default ShelfMerge;
