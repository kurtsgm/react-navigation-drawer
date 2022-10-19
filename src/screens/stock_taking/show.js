import React, { Component } from "react";
import {
  Container,
  Header,
  Title,
  Content,
  Button,
  Icon,
  Text,
  Left,
  Body,
  Right,
  List,
  ListItem,
  Footer,
  FooterTab,

} from "native-base";
import styles from "./styles";
import Dialog from "react-native-dialog";

import * as AppActions from '../../redux/actions/AppAction'
import { apiFetch, GET_SHELF_INFO, GET_STOCK_TAKING,GET_PRODUCTS } from "../../api"
import { normalize_shelf_barcode, getMinShelfLenghth, ShelfInput } from '../../common'
import { Grid, Col, Row } from "react-native-easy-grid";

class StockTakingShow extends Component {
  constructor(props) {
    super(props)
    const { params } = this.props.navigation.state;
    const { shop } = params

    this.state = {
      stock_taking: params.stock_taking,
      isModalVisible: false,
      isQuantityModalVisible: false,
      isProductModalVisible: false,
      isProductSelectModalVisible: false,
      currentItemKey: null,
      barcode: null,
      candidateProducts: []
    }
    this.reload = this.reload.bind(this)
    this.onBack = this.onBack.bind(this)
    this.onShelfTokenChanged = this.onShelfTokenChanged.bind(this)
    this.fetchProduct = this.fetchProduct.bind(this)
    this.reload()
  }


  reload() {
    let { stock_taking } = this.state
    apiFetch(GET_STOCK_TAKING, { id: stock_taking.id }, (data) => {
      this.setState({ stock_taking: data })
    })
  }


  fetchProduct( barcode) {
    let { stock_taking } = this.state
    apiFetch(GET_PRODUCTS, { barcode: barcode, shop_id: stock_taking.shop_id }, (product_data) => {
      if (product_data.length > 1) {
        this.setState({ candidateProducts: product_data })
        this.setState({ isProductModalVisible: true })

      }
    })
  }

  onShelfTokenChanged(token) {
    let shelf = this.state.stock_taking.stock_taking_items.find((item) => {
      return item.shelf.token == token
    })
    if (!shelf) {
      apiFetch(GET_SHELF_INFO, { token: token, shop_id: this.state.stock_taking.shop_id }, (shelf_data) => {
        if (shelf_data) {
          let shelf
          for (let item of this.state.stock_taking.stock_taking_items) {
            if (item.shelf.id == shelf_data.id) {
              shelf = item
              break
            }
          }
          if (!shelf) {
            shelf = {
              shelf: shelf_data,
              stock_taking_id: this.state.stock_taking.id,
            }
            this.state.stock_taking.stock_taking_items.push(shelf)
          }
        }
      })
    }
  }

  onBack() {
    this.reload()
  }

  organizeStockTakingItems(stock_taking_items) {
    let rows = []
    let previous_shelf_token = null
    let keyIndex = 0
    for (let item of stock_taking_items) {
      item.key = keyIndex++
      if (previous_shelf_token != item.shelf.token) {
        rows.push(<ListItem itemDivider>
          <Body>
            <Text>{item.shelf.token}</Text>

          </Body>
          <Right>
            <Button transparent>
              <Icon name="add" onPress={() => {
                this.setState({isProductModalVisible:true})
              }} />
            </Button>
          </Right>
        </ListItem>)
      }
      rows.push(
        <ListItem
          key={item.key}
          onPress={() => {
            this.setState({ isQuantityModalVisible: true, currentItemKey: item.key })
          }}
        >
          <Grid>
            <Col size={1}>
              <Text>{`${item.product_storage.product.uid}\n${item.product_storage.product.name}`}</Text>
            </Col>
            <Col size={1}>
              <Text>
                {[
                  item.product_storage.storage_type_name,
                  item.product_storage.expiration_date,
                  item.product_storage.batch
                ].filter(e => e).join("\n")}
              </Text>
            </Col>
            <Col size={1}>
              {
                item.after_adjustment_pcs == null ? <Text>{`${item.before_adjustment_pcs}\n未盤`}</Text> :
                  <Text style={item.after_adjustment_pcs == item.before_adjustment_pcs ? styles.green : styles.orange}>{item.after_adjustment_pcs}</Text>
              }
            </Col>

          </Grid>
        </ListItem>
      )
      previous_shelf_token = item.shelf.token
    }
    return rows
  }


  render() {
    let { stock_taking } = this.state
    let rows = this.organizeStockTakingItems((stock_taking.stock_taking_items || []).sort((a, b) => {
      return a.shelf.token.localeCompare(b.shelf.token)
    }))

    return (
      <Container style={styles.container}>
        {/* 儲位Dialog */}
        <Dialog.Container visible={this.state.isModalVisible}>
          <Dialog.Title>請輸入儲位</Dialog.Title>
          <Dialog.Input keyboardType='numeric'
            placeholder='請輸入儲位'
            value={this.state.barcode}
            autoFocus={true}
            onChangeText={(text) => this.setState({ barcode: normalize_shelf_barcode(text.toUpperCase()) })}
            onFocus={() => this.setState({ barcode: null })}
            onEndEditing={
              (event) => {
                let barcode = normalize_shelf_barcode(event.nativeEvent.text.trim())
                this.setState({ isModalVisible: false })
                this.onShelfTokenChanged(barcode)

              }
            }
            returnKeyType="done" />
          <Dialog.Button label="取消" onPress={() => this.setState({ isModalVisible: false })} />
        </Dialog.Container>

        {/* 商品選擇Dialog */}
        <Dialog.Container visible={this.state.isProductSelectModalVisible}>
          <Dialog.Title>請選擇商品</Dialog.Title>
          <Dialog.List>
            {
              this.state.candidateProducts.map((product) => {
                <Dialog.ListItem>
                  <Text>{product.name}</Text>
                </Dialog.ListItem>
              })
            }
          </Dialog.List>
        </Dialog.Container>

        {/* 儲位Dialog */}
        <Dialog.Container visible={this.state.isProductModalVisible}>
          <Dialog.Title>請輸入或掃描品號</Dialog.Title>
          <Dialog.Input placeholder='請輸入品號或條碼'
            autoFocus={true}
            onEndEditing={
              (event) => {
                let barcode = event.nativeEvent.text.trim()
                if(barcode){
                  this.setState({ isProductModalVisible: false })
                  this.fetchProduct(barcode)  
                }
              }
            }
            returnKeyType="done" />
          <Dialog.Button label={<Icon name="camera" />} onPress={() => {
            this.setState({ isProductModalVisible: false })
            this.props.navigation.navigate("BarcodeScanner", {
              onBarcodeScanned: (barcode) => {
                this.fetchProduct(barcode)
              }
            })
          }} />
          <Dialog.Button label="取消" onPress={() => this.setState({ isProductModalVisible: false })} />
        </Dialog.Container>

        {/* 盤點Dialog */}
        <Dialog.Container visible={this.state.isQuantityModalVisible}>
          <Dialog.Title>請輸入盤點數量</Dialog.Title>
          <Dialog.Input keyboardType='numeric'
            placeholder='請輸入盤點數量'
            autoFocus={true}
            onEndEditing={
              (event) => {
                this.setState({ isQuantityModalVisible: false })
                let quantity = parseInt(event.nativeEvent.text.trim())
                let item = this.state.stock_taking.stock_taking_items.find((item) => {
                  return item.key == this.state.currentItemKey
                })
                if (item) {
                  item.after_adjustment_pcs = quantity
                }
                this.setState({ currentItemKey: null, stock_taking: this.state.stock_taking })

              }
            }
            returnKeyType="done" />
          <Dialog.Button label="取消" onPress={() => this.setState({ isQuantityModalVisible: false })} />
        </Dialog.Container>
        <Header>
          <Left>
            <Button
              transparent
              onPress={() => {
                this.props.navigation.state.params.onBack()
                this.props.navigation.goBack()
              }
              }
            >
              <Icon name="arrow-back" />
            </Button>
          </Left>
          <Body>
            <Title>{stock_taking.name}</Title>
          </Body>
          <Right>
            <Button transparent>
              <Icon name="refresh" onPress={() => this.reload()} />
            </Button>
          </Right>
        </Header>
        <Content>
          <List>
            {rows}
          </List>
        </Content>
        <Footer>
          <FooterTab>
            <Button active full bordered onPress={() => {
              this.props.navigation.navigate("BarcodeScanner", {
                onBarcodeScanned: (barcode) => {
                  this.onShelfTokenChanged(barcode)
                }
              })
            }}>
              <Icon name="camera" /><Text>掃描儲位</Text>
            </Button>
            <Button full active bordered onPress={() => {
              this.setState({ isModalVisible: true })
            }}>
              <Text>輸入儲位</Text>
            </Button>
          </FooterTab>
        </Footer>
      </Container>
    );
  }
}

export default StockTakingShow;