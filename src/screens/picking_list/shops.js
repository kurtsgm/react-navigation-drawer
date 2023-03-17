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
  ListItem
} from "native-base";
import styles from "./styles";
import Dialog from "react-native-dialog";

import * as AppActions from '../../redux/actions/AppAction'
import { apiFetch, GET_PICKING_LISTS, GET_PICKING_LIST } from "../../api"
import { Grid, Col, Row } from "react-native-easy-grid";

class PickingListShops extends Component {
  constructor(props) {
    super(props)
    this.state = {
      shops: [],
      target_picking_list_id: null,
      isModalVisible: false
    }
    this.reload = this.reload.bind(this)
    this.getPickingList = this.getPickingList.bind(this)
    this.onBack = this.onBack.bind(this)
    this.reload()
  }

  getPickingList(id) {
    apiFetch(GET_PICKING_LIST, {id: id}, (picking_list) => {
      this.props.navigation.navigate("PickingListQC", picking_list)
    })
  }
  reload() {
    apiFetch(GET_PICKING_LISTS, {}, (picking_lists) => {
      let shops = {}
      for (let picking_list of picking_lists) {
        if (shops[picking_list.shop_id]) {
          shops[picking_list.shop_id].count += 1
        } else {
          shops[picking_list.shop_id] = {
            name: picking_list.shop_name,
            count: 1,
            done_count: 0,
            id: picking_list.shop_id
          }
        }
        if (picking_list.status == "done" || picking_list.status == 'terminated') {
          shops[picking_list.shop_id].done_count += 1
        }
      }
      this.setState({
        shops: Object.keys(shops).map((shop_id) => shops[shop_id])
      })
    })
  }

  onBack() {
    this.reload()
  }
  render() {
    let rows = []
    let shops = this.state.shops
    shops.sort((a,b)=>{
      if(a.done_count == a.count){
        return 1
      }else{
        return -1
      }
    })
    for (let shop of shops) {
      rows.push(
        <ListItem key={shop.id} button onPress={() => {
          this.props.navigation.navigate("PickingLists", { shop_id: shop.id, shop_name: shop.name, onBack: this.onBack })
        }
        }>
          <Left>
            {
              shop.done_count == shop.count ? <Icon name="checkmark-circle" style={{ color: "#3ADF00" }} /> : null
            }
            <Text>
              {shop.name}
            </Text>
          </Left>
          <Body>
            <Text>
              {`[${shop.done_count}/${shop.count}]`}
            </Text>
          </Body>
          <Right>
            <Icon name="arrow-forward" style={{ color: "#999" }} />
          </Right>

        </ListItem>)
    }

    return (
      <Container style={styles.container}>
        <Header>
          <Left>
            <Button
              transparent
              onPress={() => this.props.navigation.openDrawer()}
            >
              <Icon name="menu" />
            </Button>
          </Left>
          <Body>
            <Title>揀貨作業</Title>
          </Body>
          <Right>
            <Button transparent>
              <Icon name="search" onPress={() => this.setState({ isModalVisible: true })} />
            </Button>
            <Button transparent>
              <Icon name="refresh" onPress={() => this.reload()} />

            </Button>
          </Right>
        </Header>
        <Content>
          <Dialog.Container visible={this.state.isModalVisible}>
            <Dialog.Title>請輸入揀貨批次</Dialog.Title>
            <Dialog.Input
              keyboardType='numeric'
              placeholder='請輸入揀貨批次'
              autoFocus={true}
              onFocus={() => this.setState({ target_picking_list_id: null })}
              onChangeText={
                (text) => {
                  this.setState({ target_picking_list_id: text })
                }
              }
              onEndEditing={(event) => {
                if(parseInt(this.state.target_picking_list_id)>0){
                  this.getPickingList(this.state.target_picking_list_id)
                }
                this.setState({ isModalVisible: false })
              }}
              returnKeyType="done" />
            <Dialog.Button label="取消" onPress={() => this.setState({ isModalVisible: false })} />
          </Dialog.Container>
          {
            this.state.shops.length > 0 ?
              <List>
                <ListItem itemDivider>
                  <Left>
                    <Text>
                      客戶
              </Text>
                  </Left>
                  <Body>
                    <Text>
                      完成/全部
              </Text>
                  </Body>
                  <Right>
                  </Right>
                </ListItem>
                {rows}
              </List> : null
          }
        </Content>
      </Container>
    );
  }
}

export default PickingListShops;