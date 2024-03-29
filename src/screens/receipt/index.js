
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


class Receipt extends Component {
  constructor(props) {
    super(props)
    this.state = {
      receipts: [],
      shop: this.props.navigation.state.params.shop
    }
    this.reload = this.reload.bind(this)
    this.onBack = this.onBack.bind(this)
    this.onReceiptUpdate = this.onReceiptUpdate.bind(this)
    this.reload()
  }
  reload() {
    apiFetch(GET_RECEIPTS,{shop_id:this.state.shop.id},(_data) => {
      this.setState({ receipts: _data })
    })
  }

  onBack(){
    this.reload()
  }

  onReceiptUpdate(receipt){
    let receipts = this.state.receipts
    for(let _r of receipts){
      if(_r.id == receipt.id){
        _r.items = receipt.items
        this.setState({receipts:receipts})
        return
      }
    }

  }

  render() {
    let rows = []
    let previous_date = null
    let receipts = this.state.receipts.sort((a, b) => {
      return new Date(a.est_date) - new Date(b.est_date)
    })
    receipts.forEach((receipt) => {
      if (previous_date != receipt.est_date) {
        rows.push(<ListItem itemDivider key={receipt.est_date}>
          <Text>{receipt.est_date}</Text>
        </ListItem>)
        previous_date = receipt.est_date
      }
      rows.push(
        <ListItem key={receipt.barcode} button onPress={() =>
          this.props.navigation.navigate("ShowReceipt",{receipt:receipt,
          onReceiptUpdate:this.onReceiptUpdate,
          onBack:this.onBack})}>
          <Left>
          {
                receipt.status == "done" ?
                  <Icon name="checkmark-circle" style={{ color: "#3ADF00" }} /> : null
              }
              {
                receipt.status == "processing" ?
                  <Icon name="flash" style={{ color: "orange" }} /> : null
              }
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
            <Title>{`入倉-${this.state.shop.name}`}</Title>
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

export default Receipt;