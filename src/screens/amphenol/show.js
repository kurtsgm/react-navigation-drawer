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
  Input,
  List,
  ListItem,
  Toast,
  Footer,
  FooterTab,
  CheckBox,
  Badge
} from "native-base";


import { Grid, Col, Row } from "react-native-easy-grid";
import { apiFetch, AMPHENOL_SHOW_RECEIPT } from "../../api"
import styles from "./styles";

import { normalize_shelf_barcode, MIN_SHELF_TOKEN_LENGTH } from '../../common'

class AmphenolShowReceipt extends Component {
  constructor(props) {
    super(props)
    const { receipt } = this.props.navigation.state.params;
    this.state = {
      receipt_id: receipt.id,
      receipt_title: receipt.title,
      items: [],
    }
    this.reload = this.reload.bind(this)
    this.onBack = this.onBack.bind(this)
  }
  componentDidMount(){
    this.reload()
  }
  reload() {
    apiFetch(AMPHENOL_SHOW_RECEIPT, {receipt_id: this.state.receipt_id}, (_data) => {
      let histories = _data.histories
      let items = []
      for(let history of histories){
        let shelf = items.filter(e=>e.shelf == history.to_shelf.token)[0]
        if(shelf){
          shelf.quantity += history.quantity
        }else{
          console.log('NOT FOUND')
          items.push({
            shelf: history.to_shelf.token,
            quantity: history.quantity
          })
          console.log(items)
        }
      }
      this.setState({items: items})
    })
  }

  onBack() {
    this.reload()
  }
  onReceived() {
    Toast.show({
      text: '已成功入庫',
      duration: 2500,
      textStyle: { textAlign: "center" }
    })
  }

  render() {
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
            <Title>{this.state.receipt_title}</Title>
          </Body>
          <Right>
          <Button transparent>
              <Icon name="refresh" onPress={() => this.reload()} />
            </Button>

          </Right>
        </Header>
        <Content>

          <List>
            <ListItem itemDivider key='head'>
              <Grid>
                <Col size={4} style={styles.vertical_center} >
                  <Text>儲位</Text>
                </Col>
                <Col size={2} style={styles.vertical_center} >
                  <Text>已上架箱數</Text>
                </Col>

              </Grid>
            </ListItem>
            {
              this.state.items.map(item => {
                return <ListItem key={item.shelf}>
                  <Grid>
                    <Col size={4} style={styles.vertical_center} >
                      <Text>{item.shelf}</Text>
                    </Col>
                    <Col size={2} style={styles.vertical_center} >
                      <Text>{item.quantity}</Text>
                    </Col>

                  </Grid>
                </ListItem>
              })
            }
          </List>
        </Content>
        <Button success full style={[styles.mb15, styles.footer]} onPress={() => {
          this.props.navigation.navigate("AmphenolReceiptShelf", {
            receipt: this.props.navigation.state.params.receipt,
            onBack: this.onBack})

        }}>
          <Text>新增上架</Text>
        </Button>

      </Container>
    );
  }
}

export default AmphenolShowReceipt;
