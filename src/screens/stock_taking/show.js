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
import { Alert, Modal, StyleSheet, Pressable, View,ScrollView } from 'react-native';

import * as AppActions from '../../redux/actions/AppAction'
import { apiFetch, GET_SHELF_INFO, GET_STOCK_TAKING, GET_PRODUCTS } from "../../api"
import { normalize_shelf_barcode, getMinShelfLenghth, ShelfInput } from '../../common'
import { Grid, Col, Row } from "react-native-easy-grid";

const QuantityModal = 'QuantityModal'
const ProductModal = 'ProductModal'
const ProductSelectModal = 'ProductSelectModal'
const ShelfModal = 'ShelfModal'

class StockTakingShow extends Component {
  constructor(props) {
    super(props)
    const { params } = this.props.navigation.state;
    const { shop } = params

    console.log(params)
    this.state = {
      stock_taking: params.stock_taking,
      visibleModal: null,
      currentItemKey: null,
      barcode: null,
      candidateProducts: [],
      shelves: new Set()
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
      this.setState({ stock_taking: data , shelves: new Set(
        data.stock_taking_items.map((item) => {
          return item.shelf.token
        })
      )})
    })
  }


  fetchProduct(barcode) {
    let { stock_taking } = this.state
    apiFetch(GET_PRODUCTS, { barcode: barcode, shop_id: stock_taking.shop_id }, (product_data) => {
      if (product_data.length > 1) {
        this.setState({ candidateProducts: product_data })
        setTimeout(() => {
          this.setState({ visibleModal: ProductSelectModal })
        }, 300)
      }
    })
  }

  onShelfTokenChanged(token) {
    let shelf = this.state.stock_taking.stock_taking_items.find((item) => {
      return item.shelf.token == token
    })
    if (!shelf) {
      apiFetch(GET_SHELF_INFO, { token: token, shop_id: this.state.stock_taking.shop_id }, (shelf_data) => {
        this.setState({ shelves: this.state.shelves.add(token)})
        if (shelf_data) {
          for(let shelf_item of shelf_data.storages){
            this.state.stock_taking.stock_taking_items.push({
              shelf_id: shelf_data.id,
              shelf: {
                token: shelf_data.token
              },
              stock_taking_id: this.state.stock_taking.id,
              before_adjustment_pcs: shelf_item.pcs,
              after_adjustment_pcs: shelf_item.pcs,
              product_storage_id: shelf_item.product_storage.id,
              product_storage: shelf_item.product_storage
            })
          }
          this.setState({...this.state.stock_taking})
        }else{
          Alert.alert("找不到儲位")
        }
      })
    }
  }

  onBack() {
    this.reload()
  }

  organizeStockTakingItems(stock_taking_items) {
    let rows = []
    let keyIndex = 0
    const shelves  = new Set(this.state.shelves)
    stock_taking_items.sort((a, b) => { return a.shelf.token.localeCompare(b.shelf.token) })

    for (let item of stock_taking_items) {
      item.key = keyIndex++
      if (shelves.has(item.shelf.token)) {
        rows.push(<ListItem itemDivider key={`${item.key}-divider`}>
          <Body>
            <Text>{item.shelf.token}</Text>
          </Body>
          <Right>
            <Button transparent>
              <Icon name="add" onPress={() => {
                this.setState({ visibleModal: ProductModal,currentShelfToken: item.shelf.token })
              }} />
            </Button>
          </Right>
        </ListItem>)
        shelves.delete(item.shelf.token)
      }
      rows.push(
        <ListItem
          key={item.key}
          onPress={() => {
            this.setState({ visibleModal: QuantityModal, currentItemKey: item.key })
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
                  <Text style={item.after_adjustment_pcs == item.before_adjustment_pcs ? styles.green : styles.orange}>{`${item.after_adjustment_pcs} / ${item.before_adjustment_pcs}`}</Text>
              }
            </Col>

          </Grid>
        </ListItem>
      )
    }
    shelves.forEach((shelf) => {
      rows.push(<ListItem itemDivider key={`${keyIndex++}-divider`}>
        <Body>
          <Text>{shelf}</Text>
        </Body>
        <Right>
          <Button transparent>
            <Icon name="add" onPress={() => {
              this.setState({ visibleModal: ProductModal,currentShelfToken: shelf })
            }} />
          </Button>
        </Right>
      </ListItem>)
    })
    return rows
  }


  render() {
    let { stock_taking } = this.state
    console.log(stock_taking)
    let rows = this.organizeStockTakingItems((stock_taking.stock_taking_items || []))
    return (
      <Container style={styles.container}>
        {/* 儲位Dialog */}
        <Dialog.Container visible={this.state.visibleModal == ShelfModal}>
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
                this.setState({ visibleModal: null })
                this.onShelfTokenChanged(barcode)

              }
            }
            returnKeyType="done" />
          <Dialog.Button label="取消" onPress={() => this.setState({ visibleModal: null })} />
        </Dialog.Container>

        {/* 商品選擇Dialog */}
        {
          this.state.candidateProducts.length > 0 ? <Modal
            visible={this.state.visibleModal == ProductSelectModal}
            animationType="slide"
            transparent={true}
          >
            <View style={styles.centeredView}>
              <View style={styles.modalView}>
                <Text style={styles.modalText}>Hello World!</Text>
                <Pressable
                  style={[styles.button, styles.buttonClose]}
                  onPress={() => this.setState({ visibleModal: null })}
                >
                  <Text style={styles.textStyle}>Hide Modal</Text>
                </Pressable>
              </View>
            </View>
          </Modal> : null
        }
        {/* 儲位Dialog */}
        <Dialog.Container visible={this.state.visibleModal == ProductModal} >
          <Dialog.Title>請輸入或掃描品號</Dialog.Title>
          <Dialog.Input placeholder='請輸入品號或條碼'
            autoFocus={true}
            onEndEditing={
              (event) => {
                let barcode = event.nativeEvent.text.trim()
                if (barcode) {
                  this.setState({ visibleModal: null })
                  this.fetchProduct(barcode)
                }
              }
            }
            returnKeyType="done" />
          <Dialog.Button label={<Icon name="camera" />} onPress={() => {
            this.setState({ visibleModal: null })
            this.props.navigation.navigate("BarcodeScanner", {
              onBarcodeScanned: (barcode) => {
                this.setState({ visibleModal: null })
                this.fetchProduct(barcode)
              }
            })
          }} />
          <Dialog.Button label="取消" onPress={() => this.setState({ visibleModal: null })} />
        </Dialog.Container>

        {/* 盤點Dialog */}
        <Dialog.Container visible={this.state.visibleModal == QuantityModal}>
          <Dialog.Title>請輸入盤點數量</Dialog.Title>
          <Dialog.Input keyboardType='numeric'
            placeholder='請輸入盤點數量'
            autoFocus={true}
            onEndEditing={
              (event) => {
                this.setState({ visibleModal: null })
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
          <Dialog.Button label="取消" onPress={() => this.setState({ visibleModal: null })} />
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
        <ScrollView>
          <List>
            {rows}
          </List>
        </ScrollView>
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
              this.setState({ visibleModal: ShelfModal })
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