import React, { Component } from "react";
import {normalize_shelf_barcode,MIN_SHELF_TOKEN_LENGTH} from '../../common'
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
import { apiFetch,BATCH_SUBMIT_SHELVES,GET_RECEIPT_ITEM ,GET_SHELF_INFO} from "../../api"
import styles from "./styles";
import {temperatureColor} from '../../common'

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
      item: item,
      shelves:shelves,
      isModalVisible: false
    }
    this.checkValid = this.checkValid.bind(this)
    this.checkUniqueness = this.checkUniqueness.bind(this)
    this.submitShelf = this.submitShelf.bind(this)
    this.reload = this.reload.bind(this)
  }
  reload(){
    let { item } = this.props.navigation.state.params
    apiFetch(GET_RECEIPT_ITEM, { receipt_id: item.receipt_id,id: item.id}, (_data) => {
      this.setState({ item: _data })
    })    
  }
  submitShelf(){
    let { item } = this.props.navigation.state.params
    return new Promise((resolve, reject) => {
      apiFetch(BATCH_SUBMIT_SHELVES, {
        receipt_id: item.receipt_id,
        id: item.id,
        shelves: this.state.shelves.map(s=>{
          return {token: s.token,pcs: s.pcs,boxes: s.boxes}
        })
      }, (data) => {
        if(data.success){
          resolve()
        }else{
          Toast.show({
            text: data.message,
            duration: 2500,
            type: 'danger',
            textStyle: { textAlign: "center" },
          })
          reject()
        }
      })
    })
  }

  checkUniqueness(){
    let tokens = this.state.shelves.filter(s=> s.token).map(shelf=>shelf.token)
    if(new Set(tokens).size !== tokens.length ){
      return false
    }
    return true
  }
  checkValid(){
    if(!this.checkUniqueness()){
      return false
    }
    for(let shelf of this.state.shelves){
      if(!shelf.token || shelf.token.length < MIN_SHELF_TOKEN_LENGTH){
        return false
      }
    }
    return true
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
          <Title>????????????</Title>
        </Body>
        <Right>
            <Button transparent>
              <Icon name="refresh" onPress={() => this.reload()} />
            </Button>
          </Right>

      </Header>
      <Dialog.Container visible={this.state.isModalVisible}>
            <Dialog.Title>??????????????????</Dialog.Title>            
            <Dialog.Button label="??????" onPress={() => {
              this.setState({ isModalVisible: false })
              this.submitShelf().then(()=>{
              this.props.navigation.state.params.onBack()
              this.props.navigation.goBack()
             },()=>{
               this.setState({ isModalVisible: false })
               this.reload()
              })}} />
            <Dialog.Button label="??????" onPress={() => this.setState({ isModalVisible: false })} />
          </Dialog.Container>

      <Content disableKBDismissScroll={true}>
        {<Card style={styles.mb}>
          <CardItem>
            <Left>
              <Text>??????</Text>
            </Left>
            <Right>
              <Text>{item.product_name}</Text>
            </Right>
          </CardItem>
          <CardItem>
            <Left>
              <Text>??????</Text>
            </Left>
            <Right>
              <Text>{item.product_uid}</Text>
            </Right>
          </CardItem>
          <CardItem>
            <Left>
              <Text>??????</Text>
            </Left>
            <Right>
              <Text>{item.product_barcode}</Text>
            </Right>
          </CardItem>
          <CardItem>
            <Left>
              <Text>??????</Text>
            </Left>
            <Right>
              <Text>{item.expiration_date}</Text>
            </Right>
          </CardItem>
          <CardItem>
            <Left>
              <Text>??????</Text>
            </Left>
            <Right>
              <Text>{item.storage_type_name}</Text>
            </Right>
          </CardItem>
          <CardItem>
            <Left>
              <Text>?????????</Text>
            </Left>
            <Right>
              <Text>{item.pcs_per_box}</Text>
            </Right>
          </CardItem>
          <CardItem>
            <Left>
              <Text>??? X ???</Text>
            </Left>
            <Right>
              <Text>{item.stack_base} X {item.stack_level} </Text>
            </Right>
          </CardItem>
          <CardItem>
            <Left>
              <Text>??????</Text>
            </Left>
            <Right>
              <Text style={{color: temperatureColor(item.product_temperature)}}>
                {item.product_temperature}
              </Text>
            </Right>
          </CardItem>

        </Card> }
        <List>
          <ListItem itemDivider key='header'>
            <Grid>
              <Col size={4} style={styles.vertical_center} >
                <Text>PCS/??????</Text>
              </Col>
              <Col size={4} style={styles.vertical_center} >
                <Text>??????</Text>
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
                <Input style={styles.vertical_center} placeholder="???????????????" autoFocus={false}
                style={shelf.warning ? {color: 'orange'}: {}}
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
                  if(this.checkUniqueness()){
                    apiFetch(GET_SHELF_INFO, { token: barcode }, data => {
                      if(data){
                        let shelves = this.state.shelves
                        for(let shelf of shelves){
                          if(shelf.token == barcode){
                            if(data && data.storages.length > 0){
                              Toast.show({
                                text: "??????????????????????????????",
                                duration: 2500,
                                textStyle: { textAlign: "center" }
                              })
                              shelf.warning = true
                            }else{
                              shelf.warning = false
                            }
                            break
                          }
                        }
                        this.setState({shelves:shelves})
                      }else{
                        Toast.show({
                          text: `?????? ${barcode} ?????????`,
                          duration: 5000,
                          type: 'danger',
                          textStyle: { textAlign: "center" },
                        })
                      }
                    })
                  }else{
                    Toast.show({
                      text: `??????????????? ${barcode} ??????`,
                      duration: 2500,
                      type: 'danger',
                      textStyle: { textAlign: "center" },
                    })
                  }
                }
              } />
                </Col>
              </Grid>
            </ListItem>

            })
          } 
        </List>
      </Content>    
      {
          this.checkValid() ?
            <View style={styles.footer}>
              <Button primary full style={[styles.mb15, styles.footer]} onPress={() => {
                this.setState({ isModalVisible: true })
              }}>
                <Text>??????</Text>
              </Button>
            </View>
            : null

        }          
    </Container>
  }
}

export default BatchReceipt;