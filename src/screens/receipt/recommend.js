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



class RecommendShelf extends Component {
  constructor(props) {
    super(props)
    const { params } = this.props.navigation.state;
    this.state = {}
  }

  receive(){
    items = this.props.navigation.state.params.map((item)=>{
      if(item.ready_to_receive > 0){
        return {id: item.id,quantity:item.ready_to_receive}
      }
    }).filter(Boolean);
    apiFetch(RECEIVE_RECEIPT, {
      id: this.props.receipt_id,
      shelf_id: this.state.shelf_id,
      items:items
    }).then((data)=>{
      if(data.status == "success"){
        console.log(data)
      }else{
        console.log(data)
      }
    });
  }
  render() {
    const { back } = this.props.navigation;
    return (
      <Container style={styles.container}>
        <Header>
          <Left>
            <Button
              transparent
              onPress={() => this.props.navigation.navigate("ShowReceipt")}
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
          <ListItem key="shelf">
            <Left>
              <Text>
              儲位
              </Text>
            </Left>
            <Button bordered light primary style={styles.mb15}>
              <Text>
                {this.props.navigation.state.params.shelf.token}
              </Text>
            </Button>
          </ListItem>

          { this.props.navigation.state.params.items.map( data=>{
              return <ListItem key={data.id}>
                <Left>
                  <Left>
                  <Text>
                    {data.product_name + " " + data.product_type_name}
                  </Text>
                  </Left>
                </Left>
                <Text>
                  {data.ready_to_receive}
                </Text>
              </ListItem>
              })
            }
          </List>
          <Button primary block style={styles.mb15} onPress={() =>{
            this.receive()
          }}>
            <Text>確認入倉</Text>
          </Button>

        </Content>
      </Container>
    );
  }
}

export default RecommendShelf;
