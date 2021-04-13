
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
  Badge,
  ListItem
} from "native-base";

import Dialog from "react-native-dialog";
import styles from "./styles";

import { apiFetch, AMPHENOL_GET_RECEIPTS } from "../../api"
import { Grid, Col, Row } from "react-native-easy-grid";


class AmphenolReceipts extends Component {
  constructor(props) {
    super(props)
    this.state = {
      receipts: [],
    }
    this.reload = this.reload.bind(this)
    this.onBack = this.onBack.bind(this)
    this.onReceiptUpdate = this.onReceiptUpdate.bind(this)
    this.reload()
  }
  reload() {
    apiFetch(AMPHENOL_GET_RECEIPTS,{},(_data) => {
      this.setState({ receipts: _data })
    })
  }

  onBack(){
    this.reload()
  }

  addNewReceipt(){
    
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
            <Title>{`安費諾入倉`}</Title>
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
        <Button primary full style={[styles.mb15, styles.footer]} onPress={() => {
              this.setState({ isModalVisible: true })            
          }}>
            <Text>新增項目</Text>
          </Button>          
          <Dialog.Container visible={this.state.isModalVisible}>
            <Dialog.Title>請輸入入倉單號</Dialog.Title>
            <Dialog.Input value={this.state.new_receipt_name}
              placeholder='請輸入入倉單號'
              autoFocus={true}
              onFocus={()=>this.setState({new_receipt_name:null})}
              onChangeText={
                (text) => {
                  this.setState({ new_receipt_name: text })
                }
              }
              onEndEditing={(event) => {
                this.setState({ isModalVisible: false })
                this.addNewReceipt()
              }}
              returnKeyType="done" />
            <Dialog.Button label="取消" onPress={() => this.setState({ isModalVisible: false })} />
          </Dialog.Container>                  
      </Container>
    );
  }
}

export default AmphenolReceipts
