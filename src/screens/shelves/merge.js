
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
  products: [],
  high_layer: null
}

class ShelfMerge extends Component {
  constructor(props) {
    super(props)
    this.state = INIT_STATE
    this.onSourceSelected = this.onSourceSelected.bind(this)
    this.toggleProduct = this.toggleProduct.bind(this)
    this.valid = this.valid.bind(this)
    this.afterMerge = this.afterMerge.bind(this)
  }

  valid() {
    return this.state.source_shelf && this.state.destination_shelf && this.state.products.filter(p => p.checked).length > 0
  }


  onSourceSelected(token) {
    token = token.trim()
    if (token) {
      apiFetch(GET_SHELF_INFO, { token: token }, data => {
        if (data) {
          this.setState({
            source_shelf: token,
            products: data.storages.map(shelf_storage => {
              return {
                checked: true,
                id: shelf_storage.id,
                pcs: shelf_storage.pcs,
                product_title: shelf_storage.product_storage.product.name,
                expiration_date: shelf_storage.product_storage.expiration_date,
                batch: shelf_storage.product_storage.batch,
                storage_type_name: shelf_storage.product_storage.storage_type_name,
                storage_id: shelf_storage.product_storage.id
              }
            })
          })
        } else {
          Toast.show({
            text: "查無資料",
            duration: 2500,
            textStyle: { textAlign: "center" }
          })

        }
      })
    }
  }

  toggleProduct(id) {
    let products = this.state.products
    for (let p of products) {
      if (p.id == id) {
        p.checked = !p.checked
      }
    }
    this.setState({ products: products })

  }

  afterMerge(){

  }
  merge() {
    apiFetch(MERGE_SHELVES, {
      from: this.state.source_shelf,
      to: this.state.destination_shelf,
      shelf_storages: this.state.products.filter(p => p.checked).map(p => {
        return { id: p.id, pcs: p.pcs }
      })
    }, data => {
      if (data.status == "success") {
        this.setState(INIT_STATE)
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
      this.afterMerge()
    })
  }

  backButton(){
    return <Button transparent onPress={() => { this.props.navigation.navigate("DrawerOpen") }}>
    <Icon name="menu" />
  </Button>
  }


  render() {
    let high_layer = this.state.high_layer
    return (
      <Container style={styles.container}>
        <Header searchBar rounded>
          <Left>
            {this.backButton()}
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
            {
              high_layer ?

                <CardItem bordered>
                  <Left>
                  <Text>{high_layer.product}</Text>
                  </Left>
                  <Body>
                    <Text>{[high_layer.storage_type_name,high_layer.expiration_date,high_layer.batch].filter(e=>e).join("\n")}</Text>
                  </Body>
                  <Right>
                    <Text>{high_layer.shelf_quantity}(個)</Text>
                  </Right>

                </CardItem> : null
            }

            <CardItem header bordered>
              <Grid>
                <Col size={4} >
                  {
                    high_layer ?
                      <Input editable={false} value={high_layer.shelf_token} />
                      :
                      <Input keyboardType='numeric' value={this.state.source_shelf}
                        placeholder='請輸入或掃描'
                        onFocus={() => this.setState({ source_shelf: "", shelves: [], products: [] })
                        }
                        onChangeText={
                          (text) => {
                            console.log(normalize_shelf_barcode(text))
                            this.setState({ source_shelf: normalize_shelf_barcode(text) })
                          }
                        }
                        onEndEditing={(event) => { this.onSourceSelected(normalize_shelf_barcode(event.nativeEvent.text)) }}
                        returnKeyType="done" />
                  }
                </Col>
                <Col size={1}>
                  <Label style={styles.arrow}>
                    <Icon name="md-arrow-round-forward"></Icon>
                  </Label>
                </Col>
                <Col size={4}>
                  <Input keyboardType='numeric' value={this.state.destination_shelf}
                    placeholder='請輸入或掃描'
                    onFocus={() => this.setState({ destination_shelf: "" })}
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
                    this.toggleProduct(product.id)
                  }}
                >
                  <Left>
                    <CheckBox checked={product.checked} onPress={() => {
                      this.toggleProduct(product.id)
                    }
                    } />

                  </Left>
                  <Body>
                    <Text style={high_layer && product.storage_id == high_layer.product_storage_id ? styles.target_product : null}>
                      {product.product_title} {[product.storage_type_name,product.expiration_date,product.batch].filter(e=>e).join("\n")}
                    </Text>

                  </Body>
                  <Right>
                    <Item success >
                      <Input keyboardType='numeric'
                        value={`${product.pcs}`}
                        onChangeText={
                          (text) => {
                            let products = this.state.products
                            for (let p of products) {
                              if (p.id == product.id) {
                                p.pcs = text
                                if (!parseInt(text) > 0) {
                                  p.checked = false
                                } else {
                                  p.checked = true
                                }
                                break
                              }
                            }
                            this.setState({ products: products })
                          }
                        }
                        returnKeyType="done" />
                    </Item>
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
