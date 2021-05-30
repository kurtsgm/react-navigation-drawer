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
import { apiFetch, actionCableCumsumer, GET_PICKING_LIST } from "../../api"
import { Grid, Col, Row } from "react-native-easy-grid";
import Barcode from 'react-native-barcode-expo';
import { store } from "../../redux/stores/store";
import { activateKeepAwake, deactivateKeepAwake } from 'expo-keep-awake';

class PickingListQC extends Component {
  constructor(props) {
    super(props)
    const { params } = this.props.navigation.state;

    this.state = {
      picking_list: params,
      orders: [],
    }
    this.reload = this.reload.bind(this)
    this.onBack = this.onBack.bind(this)
    this.connect = this.connect.bind(this)
    this.reload()
  }
  componentDidMount(){
    activateKeepAwake(); 
    this.connect()
  }
  componentWillUnmount(){
    deactivateKeepAwake(); 
    if(global.cable_connected){
      global.cable_connected.unsubscribe()
      global.cable_connected = null
    }
  }
  reload(){
    apiFetch(GET_PICKING_LIST, { id: this.state.picking_list.id }, (_data) => {
      this.setState({
        orders: _data.orders.filter(order=>['done','processing'].includes(order.status))
      })
    })
  }

  connect() {
    let consumer = actionCableCumsumer()
    let self = this
    if(!global.cable_connected){
      global.cable_connected = consumer.subscriptions.create({ channel: 'AppQcChannel' }, {
        connected() {
          console.log("CONNECTED!")
        },
        disconnected() {
          global.subscription = null
          console.log('disconnected')
        },
        appear() {
          console.log('appear')
        },
        away() {
          console.log('away')
        },
        received(_data) {
          let data = JSON.parse(_data)
          console.log(data)
          if(self){
            if(data.username == store.getState().username){
              console.log(data.username)
              self.setState({
                orders: self.state.orders.map(order=>{
                  if(order.id == data.processing_id){
                    order.processing = true
                  }else{
                    order.processing = false
                  }
                  return order
                })
              })
            }
            if(data.picking_list_id == self.state.picking_list.id){
              let orders = self.state.orders
              for(let order of orders){
                for(let data_order of data.orders){
                  if(data_order.id ==order.id){
                    order.status = data_order.status
                    break
                  }
                }
              }
              self.setState({orders: orders})
            }
  
          }
        }
  
    })}

  }

  onBack() {
    this.reload()
  }
  render() {
    let rows = []
    let status = null
    for (let order of this.state.orders) {
      switch(order.status){
        case 'done':
          status =  <Icon name="checkmark-circle" style={{ "top":20,color: "#3ADF00" }} /> 
          break
        default:
          status = null  
      }
  
      rows.push(
        <ListItem key={order.barcode} style={order.processing ? {backgroundColor: 'lightgreen',width: '100%', marginLeft: 0, paddingLeft: 0, paddingRight: 0, marginRight: 0} : {}}>
          <Grid>
            <Row >
            <Col size={1}>
              </Col>
              <Col size={1}>
                { status }
              </Col>
              <Col size={8}>
                <Barcode height={50} value={`${order.barcode}`}  background={null} format="CODE128" text={order.name}/>
              </Col>

            </Row>
          </Grid>

        </ListItem>)

    }

    return (
      <Container style={styles.container}>
        <Header>
          <Left>
            <Button
              transparent
              onPress={() => {
                this.onBack()
                this.props.navigation.goBack()
              }
              }
            >
              <Icon name="arrow-back" />
            </Button>
          </Left>
          <Body>
            <Title>QC列表
              {store.getState().username}
            </Title>
          </Body>
          <Right>
            <Button transparent>
              <Icon name="refresh" onPress={() => this.reload()} />
            </Button>
          </Right>
        </Header>

        <Content>
          <List>
          {
            rows
          }

          </List>
        </Content>
      </Container>
    );
  }
}

export default PickingListQC;