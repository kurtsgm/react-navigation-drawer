
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
import { normalize_shelf_barcode, boxText, getShelfLayer,ShelfInput } from '../../common'
import { Grid, Row, Col } from "react-native-easy-grid";
import Dialog from "react-native-dialog";

const INIT_STATE = {
  shelves: [],
  source_shelf: null,
  destination_shelf: null,
  products: [],
  high_layer: null,
  all_checked: false,
  set_for_picking: false,
  sending: false,
  selected_shops: [],
  isModalVisible: false
}


class ShelfMerge extends Component {
  constructor(props) {
    super(props)
    this.state = INIT_STATE
    this.onSourceSelected = this.onSourceSelected.bind(this)
    this.setSourceData = this.setSourceData.bind(this)
    this.toggleProduct = this.toggleProduct.bind(this)
    this.valid = this.valid.bind(this)
    this.afterMerge = this.afterMerge.bind(this)
    this.extra_info = this.extra_info.bind(this)
    this.toggleAll = this.toggleAll.bind(this)
    this.toggleShop = this.toggleShop.bind(this)
    this.isLayerOne = this.isLayerOne.bind(this)
    this.mergeOptions = this.mergeOptions.bind(this)
    this.title = '合併／移動儲位'
  }

  valid() {
    return !this.state.sending && this.state.source_shelf && this.state.destination_shelf && this.state.products.filter(p => p.checked).length > 0
  }
  setSourceData(data) {
    let products = data.storages.map(shelf_storage => {
      return {
        shop_id: shelf_storage.product_storage.shop_id,
        shop_name: shelf_storage.product_storage.shop_name,
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
      source_shelf: data.token,
      all_checked: products.reduce((checked, p) => { return p.checked && checked }, true),
      products: products,
      selected_shops: new Set(products.map(p=>p.shop_id))
    })
  }

  onSourceSelected(token) {
    token = token.trim()
    if (token) {
      apiFetch(GET_SHELF_INFO, { token: token }, data => {
        if (data) {
          this.setSourceData(data)
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
    let selected_shops = new Set()
    for (let product of products) {
      product.checked = !this.state.all_checked
      product.checked ? selected_shops.add(product.shop_id) : selected_shops.delete(product.shop_id)
    }
    this.setState({ products: products, all_checked: !this.state.all_checked,selected_shops:selected_shops })
  }

  toggleShop(shop_id){
    let selected = this.state.selected_shops
    let all_checked = true
    if(selected.has(shop_id)){
      selected.delete(shop_id)
    }else{
      selected.add(shop_id)
    }
    let products = this.state.products
    for (let product of products) {
      if(product.shop_id == shop_id){
        product.checked = selected.has(shop_id)
      }
      all_checked &= product.checked
    }
    this.setState({ products: products, all_checked: all_checked && selected.has(shop_id) ,selected_shops: selected})
  }

  mergeOptions() {
    return {}
  }

  merge() {
    this.setState({ sending: true })
    apiFetch(MERGE_SHELVES, Object.assign({}, this.mergeOptions(), {
      from: this.state.source_shelf,
      to: this.state.destination_shelf,
      set_for_picking: this.state.set_for_picking,
      shelf_storages: this.state.products.filter(p => p.checked).map(p => {
        return { id: p.id, pcs: p.pcs }
      })
    }), data => {
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
        this.setState({ sending: false })
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
    return shelf && getShelfLayer(shelf) == "1" && !this.is_warehouse_merge
  }

  render() {
    let high_layer = this.state.high_layer
    let product_rows = []
    let previous_shop = null
    let involved_shops = new Set(this.state.products.map(p=>p.checked ? p.shop_id : null))
    involved_shops.delete(null)
    let shops_count = involved_shops.size

    for (let product of this.state.products.sort((a, b) => a.shop_id - b.shop_id)) {
      if (previous_shop != product.shop_id) {
        product_rows.push(<ListItem itemDivider key={`divider-${product.shop_id}`}>
          <Grid>
            <Col size={1} >
              <CheckBox checked={this.state.selected_shops.has(product.shop_id)}
                onPress={() => {
                  this.toggleShop(product.shop_id)
                }} />
            </Col>
            <Col size={6} >
              <Text>{product.shop_name}</Text>
            </Col>
          </Grid>
        </ListItem>)
        previous_shop = product.shop_id
      }
      product_rows.push(<ListItem key={product.id}
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
      </ListItem>)
    }



    return (
      <Container style={styles.container}>
        <Header searchBar rounded>
          <Left>
            {this.backButton()}
          </Left>
          <Body>
            <Title>
              {this.title}
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
                        <ShelfInput keyboardType='numeric' value={this.state.source_shelf}
                          placeholder='請輸入或掃描'
                          onFocus={() => this.setState({ source_shelf: "", shelves: [], products: [] })
                          }
                          onChangeText={
                            (text) => {
                              this.setState({ source_shelf: normalize_shelf_barcode(text) })
                            }
                          }
                          onEndEditing={(event) => { this.onSourceSelected(normalize_shelf_barcode(event.nativeEvent.text)) }}
                          returnKeyType="done" />
                    }
                    {
                      high_layer ? null :
                        <Button
                          transparent
                          onPress={() =>
                            this.props.navigation.navigate("BarcodeScanner", {
                              onBarcodeScanned: (barcode) => {
                                this.onSourceSelected(normalize_shelf_barcode(barcode))
                              }
                            }
                            )
                          }
                        >
                          <Icon name="camera" />
                        </Button>
                    }
                  </Col>
                  <Col size={1}>
                    <Label style={styles.arrow}>
                      <Icon name="arrow-forward"></Icon>
                    </Label>
                  </Col>
                  <Col size={4}>
                    <ShelfInput keyboardType='numeric' value={this.state.destination_shelf}
                      placeholder='請輸入或掃描'
                      onFocus={() => this.setState({ destination_shelf: "" })}
                      onChangeText={
                        (text) => {
                          this.setState({ destination_shelf: normalize_shelf_barcode(text) })
                        }
                      }
                      returnKeyType="done" />
                    <Button
                      transparent
                      onPress={() =>
                        this.props.navigation.navigate("BarcodeScanner", {
                          onBarcodeScanned: (barcode) => {
                            this.setState({ destination_shelf: normalize_shelf_barcode(barcode) })
                          }
                        }
                        )
                      }
                    >
                      <Icon name="camera" />
                    </Button>
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
                  <Text style>選擇全部</Text>
                </Col>
                <Col size={2}>
                  {
                    shops_count > 1 ? <Text style={[styles.red,styles.font_20]}> {`(${shops_count} 客戶)`} </Text> : null
                  }

                </Col>
              </Grid>
            </ListItem>
            {
              product_rows
            }
          </List>

        </Content>
        <View style={styles.footer}>
          {this.valid() ?
            <Button primary full style={[styles.mb15, styles.footer]} onPress={() => {
              if(shops_count > 1){
                this.setState({isModalVisible: true})

              }else{
                this.merge()
              }
            }}>
              <Text>確認移入</Text>
            </Button> : null
          }
        </View>
        {
          shops_count > 1 ?  <Dialog.Container visible={this.state.isModalVisible}>
          <Dialog.Title>{`確認移動 ${shops_count} 個客戶的品項?`}</Dialog.Title>            
          <Dialog.Button label="確認" onPress={() => {
            this.setState({ isModalVisible: false })
            this.merge()
          }} />
          <Dialog.Button label="取消" onPress={() => this.setState({ isModalVisible: false })} />
        </Dialog.Container> : null
        }

      </Container>
    );
  }
}


export default ShelfMerge;
