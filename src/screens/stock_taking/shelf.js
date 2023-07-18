import React, { Component } from "react";
import {
  Container,
  Header,
  Title,
  Content,
  Button,
  Icon,
  Left,
  Body,
  Right,
  List,
  ListItem,
  Footer,
  FooterTab,
  Text,
  Input

} from "native-base";
import { View, Alert } from 'react-native';
import styles from "./styles";
import Dialog from "react-native-dialog";
import { apiFetch, GET_STOCK_TAKING_SHELF, GET_SHELF_INFO, CONFIRM_STOCK_TAKING_SHELF } from "../../api"
import { Grid, Col, Row } from "react-native-easy-grid";

import { normalize_shelf_barcode, getMinShelfLenghth, ShelfInput, shelfKeyboardType } from '../../common'

const QuantityModal = 'QuantityModal'
const ProductModal = 'ProductModal'
class StockTakingShelf extends Component {
  constructor(props) {
    super(props)
    const { params } = this.props.navigation.state;
    const { shop } = params

    this.state = {
      visibleModal: null,
      items: []
    }
    this.reload = this.reload.bind(this)
    this.reload()
  }


  reload() {
    const { stock_taking, stock_taking_shelf } = this.props.navigation.state.params

    apiFetch(GET_SHELF_INFO, { token: stock_taking_shelf.shelf.token, shop_id: stock_taking.shop_id }, shelf_data => {
      apiFetch(GET_STOCK_TAKING_SHELF, { stock_taking_id: stock_taking.id, id: stock_taking_shelf.id }, (stock_taking_items) => {
        items = shelf_data.storages
        for (let item of items) {
          item.key = item.product_storage.id
          let stock_taking_item = stock_taking_items.find(e => e.product_storage_id == item.product_storage.id)
          if (stock_taking_item) {
            item.before_adjustment_pcs = stock_taking_item.before_adjustment_pcs
            item.after_adjustment_pcs = stock_taking_item.after_adjustment_pcs
          } else {
            item.before_adjustment_pcs = item.pcs
            item.after_adjustment_pcs = null
          }
        }
        this.setState({ items })
      })
    })


  }



  render() {
    const { stock_taking } = this.props.navigation.state.params
    const { items } = this.state


    return (
      <Container style={styles.container}>
        {/* 盤點Dialog */}
        <Dialog.Container visible={this.state.visibleModal == QuantityModal}>
          <Dialog.Title>請輸入盤點數量</Dialog.Title>
          <Dialog.Input keyboardType={'numeric'}
            placeholder='請輸入盤點數量'
            autoFocus={true}
            onEndEditing={
              (event) => {
                this.setState({ visibleModal: null })
                let quantity = parseInt(event.nativeEvent.text.trim())
                let item = this.state.items.find((item) => {
                  return item.key == this.state.currentItemKey
                })
                if (item) {
                  item.after_adjustment_pcs = quantity
                }
                this.setState({ currentItemKey: null, items: items })

              }
            }
            returnKeyType="done" />
          <Dialog.Button label="取消" onPress={() => this.setState({ visibleModal: null })} />
        </Dialog.Container>
        <Header>
          <Grid>
            <Row>
              <Col size={1}>
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
              </Col>
              <Col size={3}>
                <Title style={{top: 13}}>{stock_taking.name}</Title>
              </Col>
              <Col size={1}>
                <Button transparent>
                  <Icon name="refresh" onPress={() => this.reload()} />
                </Button>
              </Col>

            </Row>
          </Grid>
        </Header>
        <Content enableResetScrollToCoords={false}>
          <List>
            {
              items.map(item => {
                return <ListItem
                  key={item.key}
                  onPress={() => {
                    this.setState({ visibleModal: QuantityModal, currentItemKey: item.key })
                  }}>
                  <Grid>
                    <Row>
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

                    </Row>
                  </Grid>
                </ListItem>
              })
            }
          </List>
        </Content>
        <View style={styles.footer}>
          <Button primary full style={[styles.mb15, styles.footer]} onPress={() => {
            apiFetch(CONFIRM_STOCK_TAKING_SHELF, {
              stock_taking_id: stock_taking.id,
              id: this.props.navigation.state.params.stock_taking_shelf.id,
              items: items.map(_item => {
                return {
                  product_storage_id: _item.product_storage.id,
                  before_adjustment_pcs: _item.before_adjustment_pcs,
                  after_adjustment_pcs: _item.after_adjustment_pcs
                }
              })
            }, (res) => {
              // this.props.navigation.state.params.onBack()
              // this.props.navigation.goBack()  
            })
          }}>
            <Text>確認</Text>
          </Button>
        </View>
      </Container>
    );
  }
}

export default StockTakingShelf;