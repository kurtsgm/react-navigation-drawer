import React, { Component } from "react";
import { Alert, View } from 'react-native';
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
  ActionSheet,
  Input,
  Footer,
  Item,
  Card,
  CardItem,
  Badge
} from "native-base";



import { Grid, Col } from "react-native-easy-grid";
import { apiFetch } from "../../api"
import styles from "./styles";


class ShowPickingList extends Component {
  constructor(props) {
    super(props)
    const { params } = this.props.navigation.state;

    let orders = {}
    for (let order of params.orders) {
      for (let product of order.products) {
        for (let storage of product.storages) {
          orders[storage.id] = orders[storage.id] || []
          orders[storage.id].push({
            picking_index: order.picking_index,
            quantity: storage.quantity
          })
        }
      }
    }
    this.state = Object.assign(ShowPickingList.arrange_items([], params.items), {
      picking_list: params,
      show_order: false,
      storage_orders: orders
    })
    this.item_generator = this.item_generator.bind(this)
    this.changeQuantity = this.changeQuantity.bind(this)
    this.changeMode = this.changeMode.bind(this)
  }


  static arrange_items(items, original_items) {
    let results = []
    let shortage = []
    for (let element of original_items) {
      let quantity = element.quantity
      for (let shelf of element.shelves) {
        if (quantity > 0 && shelf.pcs > 0) {
          let found_item = null
          let ready_to_pick = Math.min(shelf.pcs, quantity)
          for (let exisiting_item of items) {
            if (shelf.storage_shelf_id == exisiting_item.storage_shelf_id) {
              found_item = exisiting_item
              if (!found_item.manual_set) {
                found_item.ready_to_pick = ready_to_pick
              }
              break
            }
          }
          if (!found_item) {
            found_item = {
              ready_to_pick: ready_to_pick,
              current_shelf: shelf.token,
              storage_shelf_id: shelf.storage_shelf_id,
              shelves: element.shelves,
              product_name: element.product_name,
              product_type_name: element.product_type_name,
              product_storage_id: element.product_storage_id,
              manual_set: false
            }
          }
          results.push(found_item)
          quantity -= found_item.ready_to_pick
        }
      }
      if (quantity != 0) {
        shortage.push({
          product_name: element.product_name,
          product_type_name: element.product_type_name,
          product_storage_id: element.product_storage_id,
          quantity: quantity
        })
      }
    }
    return {
      items: results,
      shortage: shortage
    }
  }

  changeMode() {
    this.setState({ show_order: !this.state.show_order })
  }

  changeQuantity(storage_shelf_id, quantity) {
    let items = this.state.items
    let target = null
    let total_quantity = 0
    for (let item of items) {
      if (item.storage_shelf_id == storage_shelf_id) {
        target = item
      }
    }
    total_quantity = this.state.picking_list.items.reduce((value, i) => {
      return i.product_storage_id == target.product_storage_id ? value + i.quantity : value
    }, 0)
    target.ready_to_pick = Math.min(quantity, total_quantity)
    target.manual_set = true

    this.setState(ShowPickingList.arrange_items(this.state.items, this.state.picking_list.items))
    return target.ready_to_pick
  }

  *item_generator(data_array) {
    for (let data of data_array) {
      yield (
        <ListItem key={data.storage_shelf_id} product_name={data.product_name} product_storage_id={data.product_storage_id}>
          <Grid>
            <Col size={4} style={styles.vertical_center} >
              <Text>
                {data.current_shelf}
              </Text>
            </Col>
            <Col size={4} style={styles.vertical_center} >
              <Input keyboardType='numeric'
                value={data.ready_to_pick}
                textAlign={'center'}
                onChangeText={
                  (text) => {
                    let items = this.state.items
                    for (let item of items) {
                      if (item.storage_shelf_id == data.storage_shelf_id) {
                        item.ready_to_pick = text
                        break
                      }
                    }
                    this.setState(items)
                  }
                }
                onEndEditing={(event) => {
                  let value = this.changeQuantity(data.storage_shelf_id, event.nativeEvent.text)
                  event.nativeEvent.text = value
                }} value={`${data.ready_to_pick}`} returnKeyType="done" />
            </Col>
            <Col size={2} style={styles.vertical_center} >
              <Button primary>
                <Text>確認</Text>
              </Button>
            </Col>
          </Grid>
        </ListItem>
      )
    }
  }

  render() {
    let picking_list = this.state.picking_list
    let list_items = []
    let prev_product_storage_id
    let current_product_storage_id
    let item_g = this.item_generator(this.state.items.sort((a, b) => a.product_storage_id - b.product_storage_id))
    let done = false
    console.log(this.state.storage_orders)
    while (!done) {
      let next = item_g.next()
      let _item = next.value
      done = next.done
      if (_item) {
        current_product_storage_id = _item.props.product_storage_id
      }


      if (done || prev_product_storage_id && current_product_storage_id != prev_product_storage_id) {
        for (let shortage of this.state.shortage) {
          if (shortage.product_storage_id === prev_product_storage_id) {
            list_items.push(
              <ListItem key={`shortage-${shortage.product_storage_id}`}>
                <Col size={4} style={styles.vertical_center} >
                  <Text style={styles.red}>

                    {shortage.quantity > 0 ? '欠缺' : '過多'}
                  </Text>
                </Col>
                <Col size={4} style={styles.vertical_center} >
                  <Text style={styles.red}>
                    {shortage.quantity}
                  </Text>
                </Col>
                <Col size={2} style={styles.vertical_center} >
                </Col>

              </ListItem>
            )
            break
          }
        }
        if (this.state.show_order) {
          list_items.push(<Content padder>
            <Card style={styles.mb} key={`card-${prev_product_storage_id}`}>
              <CardItem header bordered>
                <Text>訂單序號 - 商品數</Text>
              </CardItem>
              {
                this.state.storage_orders[prev_product_storage_id].map((order) => {
                  return <CardItem key={`${prev_product_storage_id}-orders-${order.picking_index}`}>
                    <Badge
                      style={{
                        borderRadius: 3,
                        height: 25,
                        width: 72,
                        backgroundColor: "black"
                      }}
                      textStyle={{ color: "white" }}
                    >
                      <Text>{order.picking_index}</Text>
                    </Badge>

                    <Text> - x {order.quantity} </Text>

                  </CardItem>

                })
              }
            </Card>
          </Content>)
        }
      }
      if (_item && current_product_storage_id != prev_product_storage_id) {
        list_items.push(<ListItem itemDivider key={`divider-${current_product_storage_id}`}>
          <Text>{_item.props.product_name}</Text>
        </ListItem>
        )
      }

      if (_item) {
        list_items.push(_item)
      }

      prev_product_storage_id = current_product_storage_id
    }


    return (
      <Container style={styles.container}>
        <Header>
          <Left>
            <Button
              transparent
              onPress={() => this.props.navigation.goBack()}
            >
              <Icon name="arrow-back" />
            </Button>
          </Left>
          <Body>
            <Title>{picking_list.shop_name} {picking_list.id}</Title>
          </Body>
          <Right>
            <Button bordered={!this.state.show_order} success small onPress={this.changeMode}>
              <Text>
                訂單
              </Text>
            </Button>
          </Right>
        </Header>
        <Content>
          <List>
            {
              list_items
            }
          </List>
        </Content>
      </Container>
    );
  }
}

export default ShowPickingList;
