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

import * as AppActions from '../../redux/actions/AppAction'
import { apiFetch, GET_PICKING_LISTS } from "../../api"
import { Grid, Col, Row } from "react-native-easy-grid";

class PickingListShops extends Component {
  constructor(props) {
    super(props)
    this.state = {
      shops: []
    }
    this.reload = this.reload.bind(this)
    this.onBack = this.onBack.bind(this)
  }
  reload() {
    apiFetch(GET_PICKING_LISTS, {}, (picking_lists) => {
      console.log(picking_lists)
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
      console.log(shops)
      this.setState({
        shops: Object.keys(shops).map((shop_id) => shops[shop_id])
      })
    })
  }

  componentWillMount() {
    this.reload()
  }
  onBack() {
    this.reload()
  }
  render() {
    let rows = []
    for (let shop of this.state.shops) {
      rows.push(
        <ListItem key={shop.id} button onPress={() => {
          this.props.navigation.navigate("PickingLists", { shop_id: shop.id, shop_name: shop.name, onBack: this.onBack })
        }
        }>
          <Left>
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
              <Icon name="refresh" onPress={() => this.reload()} />
            </Button>
          </Right>
        </Header>

        <Content>
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