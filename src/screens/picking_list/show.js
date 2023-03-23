import React, { Component } from "react";
import { View } from 'react-native';
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
  Input,
  Footer,
  FooterTab,
  Item,
  Card,
  CardItem,
  Badge,
  Toast
} from "native-base";


import { store } from '../../redux/stores/store'

import { Grid, Col, Row } from "react-native-easy-grid";
import { apiFetch, CONFIRM_PICKING, GET_PICKING_LIST, ACTIVATE_PICKING } from "../../api"
import { boxText, getShelfLayer, shelfSorter, ShelfInput, shelfKeyboardType } from '../../common'
import Barcode from 'react-native-barcode-expo';
import styles from "./styles";

const PRODUCT_MODE = "product_mode"
const SHELF_MODE = "shelf_mode"
class ShowPickingList extends Component {
  constructor(props) {
    super(props)
    const { params } = this.props.navigation.state;

    this.normalize_order = this.normalize_order.bind(this)

    params.items = []
    this.state = Object.assign(ShowPickingList.arrange_items([], []), {
      picking_list: params,
      show_order: false,
      show_picked: false,
      storage_orders: [],
      auto_confirming: false,
      sorting_mode: PRODUCT_MODE,
      shelf_items: [],
      searchKeyword: '',
    })
    this.item_generator = this.item_generator.bind(this)
    this.changeQuantity = this.changeQuantity.bind(this)
    this.changeMode = this.changeMode.bind(this)
    this.togglePicked = this.togglePicked.bind(this)
    this.reload = this.reload.bind(this)
    this.autoConfirm = this.autoConfirm.bind(this)
    this.onConfirmed = this.onConfirmed.bind(this)
    this.onBack = params.onBack
    this.firstButton = null
    this.activate = this.activate.bind(this)
    this.sortByShelf = this.sortByShelf.bind(this)
    this.processingOrders = this.processingOrders.bind(this)
    this.reload()
  }

  normalize_order(orders) {
    let results = {}
    for (let order of orders) {
      for (let product of order.products) {
        for (let storage of product.storages) {
          results[storage.product_storage_id] = results[storage.product_storage_id] || []
          results[storage.product_storage_id].push({
            picking_index: order.picking_index,
            quantity: storage.quantity
          })
        }
      }
    }
    return results
  }
  activate() {
    apiFetch(ACTIVATE_PICKING, { id: this.state.picking_list.id }, (data) => {
      this.reload()
    })
  }

  switchSorting() {
    if (this.state.sorting_mode == PRODUCT_MODE) {
      this.setState({ sorting_mode: SHELF_MODE })
    } else {
      this.setState({ sorting_mode: PRODUCT_MODE })
    }
  }

  sortByShelf(items) {
    shelves = []
    shortages = []
    for (let item of items) {
      let quantity_remain = item.quantity - item.picked_quantity
      for (let shelf of item.shelves.filter(shelf => {
        if(this.state.searchKeyword != '') {
          return shelf.token.toUpperCase().includes(this.state.searchKeyword.toUpperCase())
        }
        return true
      })) {
        if (quantity_remain <= 0) {
          break
        }
        let to_pick = Math.min(shelf.pcs, quantity_remain)
        shelves.push(Object.assign({}, shelf, {
          item_id: item.id,
          product_barcode: item.product_barcode,
          product_box_pcs: item.product_box_pcs,
          product_expiration_date: item.product_expiration_date,
          product_name: item.product_name,
          product_storage_id: item.product_storage_id,
          product_type_name: item.product_type_name,
          product_uid: item.product_uid,
          batch: item.batch,
          to_pick: to_pick,
          picked: false,
          key: shelf.storage_shelf_id
        }))
        quantity_remain -= to_pick
      }
      if (quantity_remain > 0) {
        shortages.push({
          product_barcode: item.product_barcode,
          product_box_pcs: item.product_box_pcs,
          product_expiration_date: item.product_expiration_date,
          product_name: item.product_name,
          product_storage_id: item.product_storage_id,
          product_type_name: item.product_type_name,
          product_uid: item.product_uid,
          batch: item.batch,
          total_quantity: item.quantity,
          shortage_quantity: quantity_remain,
          key: `shortage-${item.id}`
        })
      }
      for (let picked_item of item.picked) {
        shelves.push({
          item_id: item.id,
          product_barcode: item.product_barcode,
          product_box_pcs: item.product_box_pcs,
          product_expiration_date: item.product_expiration_date,
          product_name: item.product_name,
          product_storage_id: item.product_storage_id,
          product_type_name: item.product_type_name,
          product_uid: item.product_uid,
          batch: item.batch,
          picked: true,
          token: picked_item.token,
          picked_quantity: picked_item.quantity,
          created_at: picked_item.created_at,
          key: `${picked_item.id}-${picked_item.created_at}`
        })
      }
    }
    this.setState({ shelf_items: shelves, shelf_shortages: shortages })
  }

  changeShelfItem(storage_shelf_id, quantity) {
    shelf_items = this.state.shelf_items
    for (let item of shelf_items) {
      if (item.storage_shelf_id == storage_shelf_id) {
        item.to_pick = Math.min(quantity, item.pcs)
        break
      }
    }
    this.setState({ shelf_items: shelf_items })
  }

  reload() {
    return new Promise((resolve, reject) => {
      apiFetch(GET_PICKING_LIST, { id: this.state.picking_list.id }, (_data) => {
        this.setState(Object.assign(ShowPickingList.arrange_items([], _data.items.sort((a, b) => a.is_done ? 0 : -1),this.state.searchKeyword), {
          picking_list: _data,
          storage_orders: this.normalize_order(_data.orders),
        }))
        this.sortByShelf(_data.items)
        resolve()
      })
    })
  }

  static arrange_items(items, original_items,searchKeyword) {
    let results = []
    let shortage = []
    for (let element of original_items) {
      let quantity = element.quantity - element.picked_quantity
      for (let shelf of element.shelves.filter(shelf => {
        if(searchKeyword != '' && searchKeyword ) {
          return shelf.token.toUpperCase().includes(searchKeyword.toUpperCase())
        }
        return true
        // return !element.picked || !element.picked.map(e => e.token).includes(shelf.token)
      })) {
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
              item_id: element.id,
              shelf_token: shelf.token,
              storage_shelf_id: shelf.storage_shelf_id,
              shelves: element.shelves,
              product_type_name: element.product_type_name,
              product_box_pcs: element.product_box_pcs,
              batch: element.batch,
              product_storage_id: element.product_storage_id,
              pcs: shelf.pcs,
              done: false,
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
          batch: element.batch,
          quantity: quantity
        })
      }
    }
    results = results.sort((a, b) => {      
      return shelfSorter(a.shelves[0].token, b.shelves[0].token)
    })

    return {
      items: results,
      shortage: shortage
    }
  }
  confirm_pick(item_id, shelf_token, quantity, callback) {
    apiFetch(CONFIRM_PICKING, {
      id: this.state.picking_list.id,
      shelf_token: shelf_token,
      item_id: item_id,
      quantity: quantity
    }, data => {
      if (data.status == "success") {
        this.reload().then(() => {
          this.onConfirmed()
        })

      } else {
        Toast.show({
          text: data.message,
          duration: 2500,
          type: 'danger',
          position: "top",
          textStyle: { textAlign: "center" }
        })
      }
    })
  }

  changeMode() {
    this.setState({
      show_order: !this.state.show_order,
      show_picked: this.state.show_order ? this.state.show_picked : false
    })
  }

  togglePicked() {
    this.setState({
      show_picked: !this.state.show_picked,
      show_order: this.state.show_picked ? this.state.show_order : false
    })
  }


  changeQuantity(storage_shelf_id, quantity) {
    let items = this.state.items
    let target = null
    let total_quantity = 0
    let others_quantity = 0
    for (let item of items) {
      if (item.storage_shelf_id == storage_shelf_id) {
        target = item
      }
    }
    total_quantity = this.state.picking_list.items.reduce((value, i) => {
      return i.product_storage_id == target.product_storage_id ? value + i.quantity : value
    }, 0)
    others_quantity = this.state.items.reduce((value, i) => {
      return i.product_storage_id == target.product_storage_id && i.storage_shelf_id != target.storage_shelf_id ? value + i.ready_to_pick : value
    }, 0)

    target.ready_to_pick = Math.min(quantity, total_quantity - others_quantity, target.pcs)
    target.manual_set = true

    this.setState(ShowPickingList.arrange_items(this.state.items, this.state.picking_list.items,this.state.searchKeyword))
    return target.ready_to_pick
  }

  *item_generator(data_array) {
    for (let data of data_array) {
      let high_layer = false
      try {
        if (parseInt(data.shelf_token.split('-')[2]) > 1) {
          high_layer = true
        }
      }
      catch {
      }
      yield (
        <ListItem key={data.storage_shelf_id} shelf={data.shelf_token} product_storage_id={data.product_storage_id}>
          <Grid>
            <Col size={4} style={styles.vertical_center} >
              <Text style={high_layer ? { "color": "orange" } : {}} >
                {data.shelf_token}
              </Text>
              <Text style={high_layer ? { "color": "orange" } : {}} >
                [
                {data.pcs} PCS
                ]
              </Text>
            </Col>
            <Col size={4} style={styles.vertical_center} >
              {data.done ? <Text style={{ "color": "green" }}>{data.ready_to_pick}</Text> :
                <Input keyboardType='numeric'
                  value={`${data.ready_to_pick}`}
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
                      this.setState({ items: items })
                    }
                  }
                  onEndEditing={(event) => {
                    let value = this.changeQuantity(data.storage_shelf_id, event.nativeEvent.text)
                    event.nativeEvent.text = value
                  }} returnKeyType="done" />

              }
              {

                data.done && boxText(data.product_box_pcs, data.ready_to_pick) ? null :
                  <Badge
                    style={{
                      borderRadius: 3,
                      height: 25,
                      width: 100,
                      backgroundColor: "#c3c3d5"
                    }}
                    textStyle={{ color: "white" }}
                  >
                    <Text>{boxText(data.product_box_pcs, data.ready_to_pick)}</Text>
                  </Badge>

              }

            </Col>
            <Col size={2} style={styles.vertical_center} >
              {data.done ? null :
                <Button ref={(ref) => !this.firstButton ? this.firstButton = ref : null} primary onPress={() => {
                  this.confirm_pick(data.item_id, data.shelf_token, data.ready_to_pick, this.onConfirmed)
                }}>
                  <Text>確認</Text>
                </Button>
              }
            </Col>
          </Grid>
        </ListItem>
      )
    }
  }

  onConfirmed() {
    if (this.state.auto_confirming) {
      this.autoConfirm()
    }
  }

  autoConfirm() {
    if (this.firstButton) {
      this.firstButton.props.onPress()
    } else {
      this.setState({ auto_confirming: false })
    }
  }
  processingOrders() {
    let picking_list = this.state.picking_list
    let not_finished = new Set([]);
    for (let item of picking_list.items) {
      if (item.picked_quantity != item.quantity) {
        for (let order of this.state.storage_orders[item.product_storage_id]) {
          not_finished.add(order.picking_index)
        }
      }
    }
    return not_finished
  }

  render() {
    let picking_list = this.state.picking_list
    let item_g = this.item_generator(this.state.items.sort((a, b) => a.product_storage_id - b.product_storage_id))
    let done = false
    let list_items = []
    let _processingOrders = this.processingOrders()
    this.firstButton = null
    if (this.state.sorting_mode == PRODUCT_MODE) {
      let sectors = this.state.picking_list.items.map(item => {
        return {
          product_storage_id: item.product_storage_id,
          picked_quantity: item.picked_quantity,
          product_name: item.product_name,
          product_uid: item.product_uid,
          product_barcode: item.product_barcode,
          product_box_pcs: item.product_box_pcs,
          product_expiration_date: item.product_expiration_date,
          product_stroage_type: item.product_type_name,
          batch: item.batch,
          quantity: item.quantity,
          items: [],
          picked: item.picked || [],
          shortage: null,
          orders: null
        }
      })

      while (!done) {
        let next = item_g.next()
        let _item = next.value
        done = next.done
        if (!_item) {
          break
        }
        for (let s of sectors) {
          if (s.product_storage_id == _item.props.product_storage_id) {
            s.items.push(_item)
            break
          }
        }
      }
      sectors = sectors.sort((a, b) => {
        try {
          if(a.items.length == 0){
            return 1
          }
          if(b.items.length == 0){
            return -1
          }
          return shelfSorter(a.items[0].props.shelf, b.items[0].props.shelf)
        } catch (e) {
          return 0
        }
      }).sort((a,b)=>{
        if( a.picked_quantity != a.quantity && b.picked_quantity != b.quantity){
          return 0
        }else{
          return a.picked_quantity == a.quantity ? 1 : -1
        }
      })
      console.log('after sort')

      console.log(sectors.map(s=>s.picked_quantity == s.quantity))
      if(this.state.searchKeyword){
        sectors = sectors.filter(s => s.items.length > 0)
      }
      for (let sector of sectors) {
        if(!this.state.searchKeyword){
          for (let shortage of this.state.shortage) {
            if (shortage.product_storage_id === sector.product_storage_id) {
              sector.shortage =
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
              break
            }
          }
        }
        if (this.state.show_picked && sector.picked.length > 0) {
          sector.picked_area = <Content disableKBDismissScroll={true} padder key={`card-${sector.product_storage_id}`} >
            <Card style={styles.mb}>
              <CardItem header bordered>
                <Text>儲位 - 商品數</Text>
              </CardItem>
              {
                sector.picked.map((shelf) => {
                  return <CardItem key={`${sector.product_storage_id}-shelf-${shelf.token}`}>
                    <Badge
                      style={{
                        borderRadius: 3,
                        height: 25,
                        width: 100,
                        backgroundColor: "blue"
                      }}
                      textStyle={{ color: "white" }}
                    >
                      <Text>{shelf.token}</Text>

                    </Badge>

                    <Text> - x {shelf.quantity} </Text>

                  </CardItem>

                })
              }
            </Card>
          </Content>
        }
        if (this.state.show_order) {
          sector.orders = <Content padder disableKBDismissScroll={true} key={`card-${sector.product_storage_id}`} >
            <Card style={styles.mb}>
              <CardItem header bordered>
                <Text>訂單序號 - 商品數</Text>
              </CardItem>
              {
                this.state.storage_orders[sector.product_storage_id].sort((a, b) => {
                  return a.picking_index - b.picking_index
                }).map((order) => {
                  return <CardItem key={`${sector.product_storage_id}-orders-${order.picking_index}`}>
                    <Badge
                      style={{
                        borderRadius: 3,
                        height: 25,
                        width: 72,
                        backgroundColor: _processingOrders.has(order.picking_index) ? "black" : '#00cc00'
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
          </Content>
        }
      }


      for (let _sector of sectors) {
        let is_done = _sector.picked_quantity == _sector.quantity
        list_items.push(
          <ListItem itemDivider style={is_done ? styles.item_done : {}} key={`divider-${_sector.product_storage_id}`}>
            <Grid>
              <Row>
                <Col>
                  <Text>{_sector.product_name}
                  </Text>
                </Col>
                <Col>
                  <Text>
                    {_sector.product_uid}
                  </Text>
                </Col>
                <Col>
                  <Text>
                    {is_done ? '已完成' : '待撿'}
                  </Text>
                </Col>
              </Row>
              <Row>
                <Col>
                  <Text>
                    {_sector.product_barcode}
                  </Text>
                </Col>
              </Row>
              <Row>
                <Col>
                  <Text style={styles.extra_info}>
                    {_sector.product_stroage_type}
                  </Text>
                </Col>
                <Col>
                  <Text style={styles.extra_info}>
                    {[_sector.product_expiration_date, _sector.batch].filter(e => e).join("\n")}
                  </Text>
                </Col>
                <Col>
                  <Text>
                    {_sector.picked_quantity}
                    /
                    {_sector.quantity}
                  </Text>
                </Col>
              </Row>
            </Grid>
          </ListItem>
        )
        if (!is_done) {
          for (let _item of _sector.items) {
            list_items.push(_item)
          }
          if (_sector.shortage) {
            list_items.push(_sector.shortage)
          }
        }
        if (this.state.show_order && _sector.orders) {
          list_items.push(_sector.orders)
        }
        if (this.state.show_picked && _sector.picked_area) {
          list_items.push(_sector.picked_area)
        }

      }
    } else {
      list_items = this.state.shelf_items.sort((a, b) => {
        return shelfSorter(a.token, b.token)
      }).filter(item => {
        return this.state.show_picked || !item.picked
      }).filter(item=>{
        if(this.state.searchKeyword && this.state.searchKeyword.length > 0){
          return item.token.toUpperCase().includes(this.state.searchKeyword.toUpperCase())
        }
        return true
      }).map(shelf_item => {
        return <ListItem itemDivider style={shelf_item.picked ? styles.item_done : ''} key={`${shelf_item.key}`}>
          <Grid>
            <Row>
              <Col size={3}>
                <Badge
                  style={{
                    borderRadius: 3,
                    height: 25,
                    width: 100,
                    backgroundColor: "green"
                  }}
                  textStyle={{ color: "white" }}
                >
                  <Text>{shelf_item.token}
                  </Text>

                </Badge>
                <Text>{shelf_item.product_name}
                </Text>
              </Col>
              <Col size={3}>
                {[shelf_item.product_uid,
                shelf_item.product_barcode,
                shelf_item.product_type_name,
                shelf_item.product_expiration_date,
                shelf_item.batch,
                ].filter(e => e).map(info => <Text key={info} style={styles.extra_info}>{info}</Text>)
                }
                {
                  <Text>
                    {boxText(shelf_item.product_box_pcs, shelf_item.picked ? shelf_item.picked_quantity : shelf_item.to_pick)}
                  </Text>
                }
                {
                  <Text>
                    [ {shelf_item.product_box_pcs, shelf_item.picked ? shelf_item.picked_quantity : shelf_item.to_pick} PCS ]
                  </Text>
                }
              </Col>
              <Col size={2}>
                {
                  shelf_item.picked ?
                    <Text>{shelf_item.picked_quantity}</Text> :
                    <ShelfInput
                      value={`${shelf_item.to_pick}`}
                      textAlign={'center'}
                      onChangeText={(text) => {
                        this.changeShelfItem(shelf_item.storage_shelf_id, text)
                      }
                      }
                      onEndEditing={(event) => {
                        this.changeShelfItem(shelf_item.storage_shelf_id, event.nativeEvent.text)
                      }} returnKeyType="done" />
                }
              </Col>
              <Col size={2} style={styles.vertical_center}>
                {
                  shelf_item.picked ?
                    <Text>{shelf_item.created_at}</Text> :
                    <Button ref={(ref) => !this.firstButton ? this.firstButton = ref : null} primary onPress={() => {
                      this.confirm_pick(shelf_item.item_id, shelf_item.token, shelf_item.to_pick, this.onConfirmed)
                    }}>
                      <Text>確認</Text>
                    </Button>

                }
              </Col>
            </Row>
          </Grid>
        </ListItem>
      })
      for (let shortage of this.state.shelf_shortages) {
        list_items.push(
          <ListItem key={shortage.key}>
            <Grid>
              <Row>
                <Col size={3} style={styles.vertical_center}>
                  <Text style={styles.red}>{shortage.product_name}
                  </Text>
                </Col>
                <Col size={3} style={styles.vertical_center}>
                  {[shortage.product_uid,
                  shortage.product_barcode,
                  shortage.product_type_name,
                  shortage.product_expiration_date,
                  shortage.batch,
                  ].filter(e => e).map(info => <Text style={styles.red}>{info}</Text>)
                  }
                </Col>
                <Col size={2} style={styles.vertical_center}>
                  <Text style={styles.red}>{shortage.shortage_quantity}
                  </Text >
                  <Text style={styles.red}>總量:{shortage.total_quantity}</Text>
                </Col>
                <Col size={2} style={styles.vertical_center}>
                  <Text style={styles.red}>欠缺</Text>
                </Col>
              </Row>
            </Grid>
          </ListItem>
        )
      }
    }

    return (
      <Container style={styles.container} >
        <Header>
          <Left>
            <Button
              transparent
              onPress={() => {
                this.onBack()
                this.props.navigation.goBack()
              }
              }
            >
              <Icon name="arrow-back" />
            </Button>
          </Left>
          <Body>
            <Title>{picking_list.shop_name} {picking_list.id}</Title>
          </Body>
          <Right>
            <Button transparent>
              <Icon name={this.state.sorting_mode == PRODUCT_MODE ? "cube" : "file-tray-stacked"} onPress={() => this.switchSorting()} />
            </Button>
            <Button transparent>
              <Icon name="refresh" onPress={() => this.reload()} />
            </Button>

          </Right>
        </Header>
        <Content disableKBDismissScroll={true}>
          <List key="picking-list">
            <ListItem>
              <Grid>
                <Col size={4} style={styles.vertical_center} >
                <Input placeholder="請輸入或者掃描儲位" search
                  value={`${this.state.searchKeyword}`}
                  onChangeText={(text) => {
                    this.setState({searchKeyword: text})
                  }}
                  textAlign={'center'}
                  onEndEditing={(event) => {
                    if(this.state.sorting_mode == PRODUCT_MODE){
                      this.setState(ShowPickingList.arrange_items(this.state.items, this.state.picking_list.items,event.nativeEvent.text))                    

                    }
                  }} returnKeyType="done" />
                </Col>
                <Col size={1} style={styles.vertical_center} >
                  <Icon name="search" />
                </Col>

                <Col size={2} style={styles.vertical_center} >
                    {
                      ["manager"].includes(store.getState().role) ?                         <Button disabled={this.auto_confirming} onPress={() => { this.setState({ auto_confirming: true }); this.autoConfirm() }}>
                      <Text>自動確認</Text>
                      </Button> : null
                    }
                </Col>
              </Grid>
            </ListItem>
            {
              list_items
            }
          </List>
        </Content>
        <Footer>
          <FooterTab>
            <Button active={this.state.show_picked} onPress={this.togglePicked}>
              <Text>
                紀錄
              </Text>
            </Button>
            <Button active={this.state.show_order} onPress={this.changeMode}>
              <Text>
                訂單
              </Text>
            </Button>
          </FooterTab>
        </Footer>
      </Container>
    );
  }
}

export default ShowPickingList;
