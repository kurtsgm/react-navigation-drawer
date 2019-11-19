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
import { apiFetch, GET_RECEIPTS_SHOPS } from "../../api"


class ReceiptVerifyShops extends Component {
  constructor(props) {
    super(props)
    this.state = {
      shops: []
    }
    this.reload = this.reload.bind(this)
    this.onBack = this.onBack.bind(this)
  }
  reload() {
    apiFetch(GET_RECEIPTS_SHOPS,{},(_data) => {
      this.setState({ shops: _data })
    })
  }

  componentWillMount() {
    this.reload()
  }
  onBack(){
    this.reload()
  }
  render() {
    let rows = []
    this.state.shops.forEach((shop) => {
      rows.push(
        <ListItem key={shop.id} button onPress={() =>{
          this.props.navigation.navigate("ReceiptVerifyIndex",{shop:shop,onBack:this.onBack})
        }
          }>
          <Left>
            <Text>
              {shop.name}
            </Text>
          </Left>
          <Right>
            <Icon name="arrow-forward" style={{ color: "#999" }} />
          </Right>
        </ListItem>)

    })

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
            <Title>入倉驗收</Title>
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
                {rows}
              </List> : null
          }
        </Content>
      </Container>
    );
  }
}

export default ReceiptVerifyShops;