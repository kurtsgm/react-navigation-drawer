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
import Dialog from "react-native-dialog";

import { apiFetch, GET_STOCK_TAKINGS } from "../../api"

class StockTakingIndex extends Component {
  constructor(props) {
    super(props)
    const { params } = this.props.navigation.state;
    const { shop } = params

    this.state = {
      stock_takings: [],
      shop: shop
    }
    this.reload = this.reload.bind(this)
    this.onBack = this.onBack.bind(this)
    this.reload()
  }

  reload() {
    apiFetch(GET_STOCK_TAKINGS, {
      shop_id: this.state.shop.id,
      reporter: true
    }, (data) => {
      console.log(data)
      this.setState({
        stock_takings: data
      })
    })
  }

  onBack() {
    this.reload()
  }
  render() {
    let rows = []
    let {stock_takings} = this.state
    for (let stock_taking of stock_takings) {
      rows.push(
        <ListItem key={stock_taking.id} button onPress={() => {
          this.props.navigation.navigate("StockTakingShow", { stock_taking: stock_taking, onBack: this.onBack })
        }
        }>
          <Body>
            <Text>
              {stock_taking.name}
            </Text>
          </Body>
          <Right>
            <Icon name="arrow-forward" style={{ color: "#999" }} />
          </Right>

        </ListItem>)
    }

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
            <Title>{this.state.shop.title}</Title>
          </Body>
          <Right>
            <Button transparent>
              <Icon name="refresh" onPress={() => this.reload()} />
            </Button>
          </Right>
        </Header>
        <Content>
          {
            this.state.stock_takings.length > 0 ?
              <List>
                <ListItem itemDivider>
                  <Body>
                    <Text>
                      盤點單號
                    </Text>
                  </Body>
                  <Right>
                  </Right>
                </ListItem>
                {rows}
              </List> : null
          }
        </Content>
      </Container>
    );
  }
}

export default StockTakingIndex;