
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
import { normalize_shelf_barcode, boxText } from '../../common'
import { Grid, Row, Col } from "react-native-easy-grid";

const INIT_STATE = {
  shelves: [],
  source_shelf: null,
  destination_shelf: null,
  products: [],
  high_layer: null,
  all_checked: false,
  set_for_picking: false
}

class ShelfMerge extends Component {
  constructor(props) {
    super(props)
    this.state = INIT_STATE
    this.onSourceSelected = this.onSourceSelected.bind(this)
    this.toggleProduct = this.toggleProduct.bind(this)
    this.valid = this.valid.bind(this)
    this.afterMerge = this.afterMerge.bind(this)
    this.extra_info = this.extra_info.bind(this)
    this.toggleAll = this.toggleAll.bind(this)
    this.isLayerOne = this.isLayerOne.bind(this)
  }

  valid() {
    return this.state.source_shelf && this.state.destination_shelf && this.state.products.filter(p => p.checked).length > 0
  }


  onSourceSelected(token) {
    token = token.trim()
    if (token) {
      apiFetch(GET_SHELF_INFO, { token: token }, data => {
        if (data) {
          let products = data.storages.map(shelf_storage => {
            return {
              checked: !this.state.high_layer || shelf_storage.product_storage.id == this.state.high_layer.product_storage_id,
              id: shelf_storage.id,
              pcs: shelf_storage.pcs,
              product_title: shelf_storage.product_storage.product.name,
              product_uid: shelf_storage.product_storage.product.uid,
              expiration_date: shelf_storage.product_storage.expiration_date,
              batch: shelf_storage.product_storage.batch,
              storage_type_name: shelf_storage.product_storage.storage_type_name,
              storage_id: shelf_storage.product_storage.id
            }
          })
          this.setState({
            source_shelf: token,
            all_checked: products.reduce((checked, p) => { return p.checked && checked }, true),
            products: products
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
    let all_checked = true
    for (let p of products) {
      if (p.id == id) {
        p.checked = !p.checked
      }
      all_checked = all_checked && p.checked
    }
    this.setState({ products: products, all_checked: all_checked })

  }

  afterMerge() {

  }

  toggleAll() {
    let products = this.state.products
    for (let product of products) {
      product.checked = !this.state.all_checked
    }
    this.setState({ products: products, all_checked: !this.state.all_checked })
  }

  merge() {
    apiFetch(MERGE_SHELVES, {
      from: this.state.source_shelf,
      to: this.state.destination_shelf,
      set_for_picking: this.state.set_for_picking,
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

  backButton() {
    return <Button transparent onPress={() => { this.props.navigation.openDrawer() }}>
      <Icon name="menu" />
    </Button>
  }
  extra_info() {

  }

  isLayerOne(shelf) {
    return shelf && shelf[6] == "1"
  }

  render() {
    let high_layer = this.state.high_layer
    console.log(this.props)
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
          <Right>
          </Right>
        </Header>
        <Content disableKBDismissScroll={true} padder>
          <Card style={styles.mb}>
            {
              high_layer ?

                <CardItem bordered>
                  <Left>
                    <Text>{high_layer.product}</Text>
                  </Left>
                  <Body>
                    <Text>{[high_layer.storage_type_name, high_layer.expiration_date, high_layer.batch].filter(e => e).join("\n")}</Text>
                  </Body>
                  <Right>
                    <Text>{high_layer.shelf_quantity}</Text>
                    {
                      boxText(high_layer.product_box_pcs, high_layer.shelf_quantity) ?
                        <Text>
                        (
                          {
                            boxText(high_layer.product_box_pcs, high_layer.shelf_quantity)
                          }
                        )
                      </Text> : null

                    }
                  </Right>

                </CardItem> : null
            }
            {
              this.extra_info()
            }
            <CardItem header bordered>
              <Grid>
                <Row>
                  <Col size={4} >
                    {
                      high_layer ?
                        <Input editable={false} value={high_layer.shelf_token} />
                        :
                        <Input keyboardType='default' value={this.state.source_shelf}
                          placeholder='請輸入儲位'
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
                    <Input keyboardType='default' value={this.state.destination_shelf}
                      placeholder='請輸入儲位'
                      onFocus={() => this.setState({ destination_shelf: "" })}
                      onChangeText={
                        (text) => {
                          this.setState({ destination_shelf: normalize_shelf_barcode(text) })
                        }
                      }
                      returnKeyType="done" />
                  </Col>
                </Row>
              </Grid>
            </CardItem>
            {
              this.isLayerOne(this.state.destination_shelf) ?
                <CardItem bordered>

                  <Row>
                    <Col size={5}>
                    </Col>
                    <Col size={1}>
                      <CheckBox checked={this.state.set_for_picking}
                        onPress={() => {
                          this.setState({ set_for_picking: !this.state.set_for_picking })
                        }} />
                    </Col>
                    <Col size={5}>
                      <Text>同時設定揀貨儲</Text>
                    </Col>
                  </Row>
                </CardItem>

                : null
            }

          </Card>
          <List>
            <ListItem>
              <Grid>
                <Col size={1}>
                  <CheckBox checked={this.state.all_checked}
                    onPress={() => {
                      this.toggleAll()
                    }} />
                </Col>
                <Col size={4}>
                  <Text>選擇全部</Text>
                </Col>
                <Col size={2}></Col>
              </Grid>
            </ListItem>
            {
              this.state.products.map(product => {
                return <ListItem key={product.id}
                  onPress={() => {
                    this.toggleProduct(product.id)
                  }}
                >
                  <Grid>
                    <Col size={1} >
                      <CheckBox checked={product.checked} onPress={() => {
                        this.toggleProduct(product.id)
                      }
                      } />
                    </Col>
                    <Col size={4} >
                      <Text style={high_layer && product.storage_id == high_layer.product_storage_id ? styles.target_product : null}>
                        {product.product_uid}
                      </Text>
                      <Text style={high_layer && product.storage_id == high_layer.product_storage_id ? styles.target_product : null}>
                        {product.product_title} {[product.storage_type_name, product.expiration_date, product.batch].filter(e => e).join("\n")}
                      </Text>
                    </Col>

                    <Col size={2} >
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
                    </Col>
                  </Grid>
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
