
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
  CheckBox,
  ListItem
} from "native-base";
import styles from "./styles";
import { Grid, Col, Row } from "react-native-easy-grid";
import * as AppActions from '../../redux/actions/AppAction'
import { apiFetch, GET_RECEIPTS } from "../../api"



class ReceiptVerifyIndex extends Component {
  constructor(props) {
    super(props)
    this.state = {
      receipts: [],
    }
    this.reload = this.reload.bind(this)
    this.onBack = this.onBack.bind(this)
    this.toggleReceipt = this.toggleReceipt.bind(this)
    this.toggleCheckAll = this.toggleCheckAll.bind(this)
    this.navigateToDetail = this.navigateToDetail.bind(this)
    this.reload()
  }
  reload() {
    const { shop } = this.props.navigation.state.params;
    apiFetch(GET_RECEIPTS, {
      to_be_verified: true,
      shop_id: shop.id
    }, (_data) => {
      this.setState({ receipts: _data })
    })
  }

  toggleCheckAll() {
    let receipts = this.state.receipts
    for (let receipt of receipts) {
      receipt.checked = !this.state.checkedAll
    }
    this.setState({ checkedAll: !this.state.checkedAll, receipts: receipts })
  }

  toggleReceipt(receipt_id) {
    let receipts = this.state.receipts
    for (let receipt of receipts) {
      if (receipt.id == receipt_id) {
        receipt.checked = !receipt.checked
        break
      }
    }
    this.setState({ receipts: receipts })
  }


  onBack() {
    this.reload()
  }

  navigateToDetail() {
    let receipts = this.state.receipts.filter(r=>r.checked)
    this.props.navigation.navigate("ShowVerifyReceipt", { receipts: receipts, onBack: this.onBack })
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
        <ListItem key={receipt.barcode} button onPress={() => this.toggleReceipt(receipt.id)}>
          <Grid>
            <Col size={1} >
              <CheckBox checked={receipt.checked} />
            </Col>
            <Col size={2} >
              <Text>
                {receipt.title}
              </Text>
            </Col>
          </Grid>
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
                <ListItem onPress={() => {
                  this.toggleCheckAll()
                }
                } >
                  <Grid>
                    <Col size={1} >
                      <CheckBox checked={this.state.checkedAll} />
                    </Col>
                    <Col size={2} >
                      <Text>
                      </Text>
                    </Col>
                    <Col size={4} >
                      <Text>
                        全選/全不選
                      </Text>
                    </Col>

                  </Grid>
                </ListItem>
                {rows}
              </List> : null
          }
        </Content>
        <View style={styles.footer}>
          {this.state.receipts.filter(receipt => receipt.checked).length > 0 ?
            <Button primary full style={[styles.mb15, styles.footer]} onPress={() => {
              this.navigateToDetail()
            }}>
              <Text>確認</Text>
            </Button> : null
          }
        </View>

      </Container>
    );
  }
}

export default ReceiptVerifyIndex;