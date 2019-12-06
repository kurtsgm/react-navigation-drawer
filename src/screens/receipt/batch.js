import React, { Component } from "react";
// import { ScrollView } from 'react-native';
import InputScrollView from 'react-native-input-scroll-view';
import {normalize_shelf_barcode} from '../../common'
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
  Card,
  CardItem,  
  Input,
  List,
  ListItem,
  Toast,
  Footer,
  FooterTab,
  CheckBox,
} from "native-base";

import Dialog from "react-native-dialog";

import { Grid, Col, Row } from "react-native-easy-grid";
import { apiFetch } from "../../api"
import styles from "./styles";

class BatchReceipt extends Component {
  constructor(props) {
    super(props)
    let { item } = this.props.navigation.state.params
    let shelves = []
    let remain = item.verified_pcs - item.received_pcs
    let index = 0
    while(remain > 0){
      let pcs = Math.min(remain,item.pcs_per_box*item.stack_base*item.stack_level)
      shelves.push({
        pcs: pcs,
        boxes: Math.ceil(pcs/item.pcs_per_box),
        key: index
      })
      index ++
      remain -= pcs
    }
    this.state = {
      shelves:shelves
    }
    this.checkValid = this.checkValid.bind(this)
  }

  checkValid(){
    let tokens = this.state.shelves.filter(s=> s.token).map(shelf=>shelf.token)
    if(new Set(tokens).size !== tokens.length ){
      Toast.show({
        text: '錯誤，儲位重複',
        duration: 2500,
        type: 'danger',
        textStyle: { textAlign: "center" },
      })
      return false
    }
    
    for(let shelf of this.state.shelves){
      if(!shelf.token || shelf.token.length < 6){
        return false
      }
    }

  }
  render() {
    let { item } = this.props.navigation.state.params
    return <Container style={styles.container}>
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
          <Title>批次入庫</Title>
        </Body>
        <Right></Right>
      </Header>
      <InputScrollView>
        {/* <Card style={styles.mb}>
          <CardItem>
            <Left>
              <Text>品名</Text>
            </Left>
            <Right>
              <Text>{item.product_name}</Text>
            </Right>
          </CardItem>
          <CardItem>
            <Left>
              <Text>品號</Text>
            </Left>
            <Right>
              <Text>{item.product_uid}</Text>
            </Right>
          </CardItem>
          <CardItem>
            <Left>
              <Text>條碼</Text>
            </Left>
            <Right>
              <Text>{item.product_barcode}</Text>
            </Right>
          </CardItem>
          <CardItem>
            <Left>
              <Text>效期</Text>
            </Left>
            <Right>
              <Text>{item.expiration_date}</Text>
            </Right>
          </CardItem>
          <CardItem>
            <Left>
              <Text>倉別</Text>
            </Left>
            <Right>
              <Text>{item.storage_type_name}</Text>
            </Right>
          </CardItem>
          <CardItem>
            <Left>
              <Text>箱入數</Text>
            </Left>
            <Right>
              <Text>{item.pcs_per_box}</Text>
            </Right>
          </CardItem>
          <CardItem>
            <Left>
              <Text>底 X 高</Text>
            </Left>
            <Right>
              <Text>{item.stack_base} X {item.stack_level} </Text>
            </Right>
          </CardItem>
        </Card> */}
        <List>
          <ListItem itemDivider key='header'>
            <Grid>
              <Col size={4} style={styles.vertical_center} >
                <Text>PCS/箱數</Text>
              </Col>
              <Col size={4} style={styles.vertical_center} >
                <Text>儲位</Text>
              </Col>
            </Grid>
          </ListItem>
          {
            this.state.shelves.map(shelf=>{
              return <ListItem key={shelf.key}>
              <Grid>
                <Col size={4} style={styles.vertical_center} >
                  <Text>{shelf.pcs} / {shelf.boxes}</Text>
                </Col>
                <Col size={4} style={styles.vertical_center} >
                <Input style={styles.vertical_center} placeholder="請輸入儲位" autoFocus={false}
              value={shelf.token}
              keyboardType='numeric'
              returnKeyType="done"
              onChangeText={
                (text) => {
                  let shelves = this.state.shelves
                  for(let input_shelf of shelves){
                    if (input_shelf.key == shelf.key){
                      input_shelf.token = normalize_shelf_barcode(text)
                      break
                    }
                  }
                  this.setState({shelves:shelves})
                }
              }
              onEndEditing={
                (event) => {
                  let barcode = event.nativeEvent.text.trim()
                  let shelves = this.state.shelves
                  for(let input_shelf of shelves){
                    if (input_shelf.key == shelf.key){
                      input_shelf.token = normalize_shelf_barcode(barcode)
                      break
                    }
                  }
                  this.setState({shelves:shelves})
                  this.checkValid()
                }
              } />
                </Col>
              </Grid>
            </ListItem>

            })
          }

          
        </List>
      </InputScrollView>
    </Container>
  }
}

export default BatchReceipt;