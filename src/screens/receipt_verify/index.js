
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
import { apiFetch, GET_RECEIPTS } from "../../api"



class ReceiptVerifyIndex extends Component {
  constructor(props) {
    super(props)
    this.state = {
      receipts: []
    }
    this.reload = this.reload.bind(this)
    this.onBack = this.onBack.bind(this)
    this.reload()
  }
  reload() {
    const { shop } = this.props.navigation.state.params;
    apiFetch(GET_RECEIPTS,{
      to_be_verified:true,
      shop_id: shop.id
    },(_data) => {
      this.setState({ receipts: _data })
    })
  }

  onBack(){
    this.reload()
  }

  render() {
    let rows = []
    let previous_date = null
    let receipts = this.state.receipts.sort((a, b) => {
      return new Date(a.est_date) - new Date(b.est_date)
    })
    const { shop } = this.props.navigation.state.params;
    receipts.forEach((receipt) => {
      if (previous_date != receipt.est_date) {
        rows.push(<ListItem itemDivider key={receipt.est_date}>
          <Text>{receipt.est_date}</Text>
        </ListItem>)
        previous_date = receipt.est_date
      }
      rows.push(
        <ListItem key={receipt.barcode} button onPress={() =>
          this.props.navigation.navigate("ShowVerifyReceipt",{receipt:receipt,
          onBack:this.onBack})}>
          <Left>
            <Text>
              {receipt.title}
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
            <Title>{`入倉驗收 ${shop.name}`}</Title>
          </Body>
          <Right>
            <Button transparent>
              <Icon name="refresh" onPress={() => this.reload()} />
            </Button>
          </Right>
        </Header>

        <Content>
          {
            this.state.receipts.length > 0 ?
              <List>
                {rows}
              </List> : null
          }
        </Content>
      </Container>
    );
  }
}

export default ReceiptVerifyIndex;