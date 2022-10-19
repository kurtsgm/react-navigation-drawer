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
import { apiFetch, GET_PICKING_LISTS, GET_PICKING_LIST, GET_SHOPS, GET_PRODUCTS } from "../../api"
import { Grid, Col, Row } from "react-native-easy-grid";

class StockTakingProduct extends Component {
  constructor(props) {
    super(props)
    this.state = {
      shops: [],
    }
    this.reload = this.reload.bind(this)
    this.onBack = this.onBack.bind(this)
    this.reload()
  }

  reload() {
    apiFetch(GET_PRODUCTS, {}, (data) => {
      this.setState({
        shops: data.shops
      })
    })
  }

  onBack() {
    this.reload()
  }
  render() {
    let rows = []
    let shops = this.state.shops
    for (let shop of shops) {
      rows.push(
        <ListItem key={shop.id} button onPress={() => {
          this.props.navigation.navigate("StockTakingIndex", { shop: shop, onBack: this.onBack })
        }
        }>
          <Body>
            <Text>
              {shop.title}
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
            <Title>盤點作業</Title>
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
                  <Body>
                    <Text>
                      客戶
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

export default StockTakingProduct;