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
import { apiFetch, AMPHENOL_RECEIVE_SHELF, AMPHENOL_CREATE_BOX_ID } from "../../api"
import styles from "./styles";

import { normalize_shelf_barcode,MIN_SHELF_TOKEN_LENGTH } from '../../common'

class AmphenolReceiptShelf extends Component {
  constructor(props) {
    super(props)
    const { receipt } = this.props.navigation.state.params;
    this.state = {
      receipt_id: receipt.id,
      receipt_title: receipt.title,
      items: [],
      shelf_token: null,
      barcode: null,
    }
    this.onReceived = this.onReceived.bind(this)
    this.addNewItem = this.addNewItem.bind(this)
    this.removeItem = this.removeItem.bind(this)
    this.checkValid = this.checkValid.bind(this)
    this.confirmShelf = this.confirmShelf.bind(this)

  }

  checkValid(qrcode){
    return qrcode.match(/^1P.+PO.+V.+L.+LWH.+GW.+Q\d+$/) ? true : false
  }


  addNewItem(qrcode) {
    apiFetch(AMPHENOL_CREATE_BOX_ID,{
      qrcode: qrcode
    },(data=>{
      let items = this.state.items
      let found = false
      for(let item of items){
        if(item.batch == data.batch){
          item.quantity += 1
          found = true
          break
        }
      }
      if (!found){
        data.key = `${data.id}${new Date().getTime()}`
        data.quantity = 1
        items.push(data)

      }
      this.setState({items: items})
    }))
  }

  confirmShelf(){
    if(this.state.items.length > 0){
      apiFetch(AMPHENOL_RECEIVE_SHELF,{
        shelf_token: this.state.shelf_token,
        receipt_id: this.state.receipt_id,
        items: this.state.items.map(item=>{
          return {
            product_storage_id: item.id,
            quantity: item.quantity
          }
        })
      },data=>{
        if (data.status == "success") {
          this.onReceived()
        } else {
          Toast.show({
            text: data.message,
            duration: 2500,
            textStyle: { textAlign: "center" }
          })

        }
      })
    }
  }

  onReceived() {
    this.props.navigation.state.params.onBack()
    this.props.navigation.goBack()

    Toast.show({
      text: '已成功入庫',
      duration: 2500,
      textStyle: { textAlign: "center" }
    })
  }
  removeItem(key){
    let items = this.state.items
    for(let item of items){
      if(item.key == key){
        item.quantity -= 1
        break
      }
    }
    this.setState({
      items: this.state.items.filter(item=>item.quantity > 0 )
    })
  }

  shelfInput() {
    return <ListItem>
      <Grid>
        <Col size={2} style={styles.vertical_center} >
          <Text>儲位</Text>
        </Col>
        <Col size={2} style={styles.vertical_center} >
          <Input placeholder="請輸入或者掃描條碼" autoFocus={false}
            value={this.state.shelf_token}
            keyboardType='numeric'
            returnKeyType="done"
            onChangeText={(text) => this.setState({ shelf_token: normalize_shelf_barcode(text.toUpperCase()) })}
            autoFocus={true}
            onEndEditing={
              (event) => {
                let shelf_token = normalize_shelf_barcode(event.nativeEvent.text.trim())
                this.setState({ shelf_token: shelf_token })
              }
            } />

        </Col>
        <Col size={1} style={styles.vertical_center} >
          <Button
            transparent
            onPress={() =>
              this.props.navigation.navigate("BarcodeScanner", {
                onBarcodeScanned: (barcode) => {
                  this.setState({ shelf_token: normalize_shelf_barcode(barcode) })
                }
              }
              )
            }
          >
            <Icon name="camera" />
          </Button>
        </Col>
      </Grid>
    </ListItem>
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
          </Right>
        </Header>
        <Content>

          <List>
            {this.shelfInput()}
            <ListItem itemDivider key='head'>
            <Grid>
                  <Col size={4} style={styles.vertical_center} >
                    <Text>批號</Text>
                  </Col>
                  <Col size={2} style={styles.vertical_center} >
                    <Text>箱數</Text>
                  </Col>

                  <Col size={1} style={styles.vertical_center} >
                    </Col>
                    </Grid>
          </ListItem>
            {
              this.state.items.map(item=>{
                return <ListItem key={item.key}>
                <Grid>
                  <Col size={4} style={styles.vertical_center} >
                    <Text>{item.batch}</Text>
                  </Col>
                  <Col size={2} style={styles.vertical_center} >
                    <Text>{item.quantity}</Text>
                  </Col>

                  <Col size={1} style={styles.vertical_center} >
                  <Button danger transparent onPress={() => {
                    this.removeItem(item.key)
                  }}>
                      <Icon name="remove-circle" />
                  </Button>
                  </Col>

                  </Grid>
                  </ListItem>
              })
            }
          </List>
        </Content>
        <Footer>
          <FooterTab>
            <Button success full onPress={() => {
              if(this.state.shelf_token && this.state.shelf_token.length >= MIN_SHELF_TOKEN_LENGTH){
                this.props.navigation.navigate("BarcodeScanner", {
                  onBarcodeScanned: (qrcode) => {
                    if(this.checkValid(qrcode)){
                      this.addNewItem(qrcode)
                    }else{
                      Toast.show({
                        text: `QRCODE錯誤 ${qrcode}`,
                        buttonText: "OK"
                      })
      
                    }
                  }
                }
                )
  
              }else{
                Toast.show({
                  text: "請先輸入儲位",
                  buttonText: "OK"
                })
              }

            }}>
              <Text style={styles.text_white} >
                新增
          </Text>
            </Button>
            <Button primary full onPress={() => {
              this.confirmShelf()
             }}>
              <Text style={styles.text_white} >

                入儲
          </Text>
            </Button>
          </FooterTab>
        </Footer>

      </Container>
    );
  }
}

export default AmphenolReceiptShelf;
