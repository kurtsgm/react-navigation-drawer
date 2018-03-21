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
  ListItem,
  ActionSheet
} from "native-base";


import { Grid, Col } from "react-native-easy-grid";
import {apiFetch,RECEIVE_RECEIPT} from "../../api"
import styles from "./styles";



class ShowReceipt extends Component {
  constructor(props) {
    super(props)
    const { params } = this.props.navigation.state;
    this.state = {
      receipt_id: params.id,
      receipt_title: params.barcode,
      items: params.items.map((item)=>{
        return {
          ready_to_receive: 0,
          id: item.id,
          product_name: item.product_name,
          product_type_name: item.product_type_name,
          received_count: item.received_count,
          box_count: item.box_count
        }
      })
    }
    this.receive = this.receive.bind(this)
    this.reload = this.reload.bind(this)

  }
  reload(){

  }
  receive(){
    items = this.state.items.map((item)=>{
      if(item.ready_to_receive > 0){
        return {id: item.id,quantity:item.ready_to_receive}
      }
    }).filter(Boolean);
    apiFetch(RECEIVE_RECEIPT, {
      id: this.state.receipt_id,
      items:items
    }).then((data)=>{
      if(data.status == "success"){
        console.log(data)
        console.log(data.receipt.items)
        this.setState({items:data.receipt.items})
      }else{
        console.log(data)
      }
    });
  }
  render() {
    console.log(this.state.items)
    return (
      <Container style={styles.container}>
        <Header>
          <Left>
            <Button
              transparent
              onPress={() => this.props.navigation.navigate("Receipt")}
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
          { this.state.items.map( data=>{
              return <ListItem key={data.id}>
                <Col size={3}>
                  <Left>
                  <Text>
                    {data.product_name + " " + data.product_type_name}
                  </Text>
                  </Left>
                </Col>
                <Col size={1}>
                  <Text>
                    {data.received_count +"/"+data.box_count}
                  </Text>
                </Col>
                <Col size={1}>
                  <Button onPress={() =>{
                    let quantities = [...Array(data.box_count-data.received_count+1).keys()].map(i=>i.toString())
                    ActionSheet.show(
                      {
                        options: quantities,
                        title: "點收數量"
                      },
                      buttonIndex => {
                        items = this.state.items
                        for(item of items){
                          if(item.id == data.id){
                            item.ready_to_receive = buttonIndex
                            break
                          }
                        }
                        this.setState({items: items})
                      }
                    )}}>
                    {data.ready_to_receive > 0 ? 
                    <Text>{data.ready_to_receive}</Text> :
                    <Icon name="checkmark"/>}
                  </Button>
                </Col>
              </ListItem>
              })
            }
          </List>
          <Button primary block style={styles.mb15} onPress={() =>{
            this.receive()
          }}>
            <Text>確認送出</Text>
          </Button>

        </Content>
      </Container>
    );
  }
}

export default ShowReceipt;
