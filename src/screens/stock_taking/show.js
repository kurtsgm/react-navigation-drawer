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

import * as AppActions from '../../redux/actions/AppAction'
import { apiFetch, GET_STOCK_TAKINGS, CREATE_STOCK_TAKING } from "../../api"

class StockTakingShow extends Component {
  constructor(props) {
    super(props)
    const { params } = this.props.navigation.state;
    const { shop } = params

    this.state = {
      stock_taking: params.stock_taking,
    }
    this.reload = this.reload.bind(this)
    this.onBack = this.onBack.bind(this)
    this.reload()
  }

  reload() {

  }

  onBack() {
    this.reload()
  }
  render() {
    let rows = []
    let { stock_taking } = this.state

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
            <Title>{stock_taking.name}</Title>
          </Body>
          <Right>
            <Button transparent>
              <Icon name="refresh" onPress={() => this.reload()} />
            </Button>
          </Right>
        </Header>
        <Content>
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
          </List>
          <Button primary full style={[styles.mb15, styles.footer]} onPress={() => {
          }}>
            <Text>掃描儲位</Text>
          </Button>
        </Content>
      </Container>
    );
  }
}

export default StockTakingShow;