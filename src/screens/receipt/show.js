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
          product_type: item.product_type_name,
          received_count: item.received_count,
          box_count: item.box_count
        }
      })
    }
    this.reload = this.reload.bind(this)

  }
  reload(){

  }
  render() {
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
        <List
            dataArray={this.state.items}
            renderRow={data =>
              <ListItem>
                <Left>
                  <Text>
                    {data.product_name + " " + data.product_type}
                  </Text>
                </Left>
                <Right>
                  <Text>
                    {data.received_count +"/"+data.box_count}
                  </Text>
                </Right>
              </ListItem>}
          />
        </Content>
      </Container>
    );
  }
}

export default ShowReceipt;
