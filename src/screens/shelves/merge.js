import React, { Component } from "react";
import {
  Container,
  Header,
  Title,
  Content,
  Button,
  Icon,
  Body,
  Left,
  Right,
  Input,
  Item,
  Form,
  List,
  ListItem,
  Text,
  Toast
} from "native-base";

import styles from "./styles"
import { apiFetch,GET_SHELVES } from "../../api"


class ShelfMerge extends Component {
  constructor() {
    super()
    this.state = {
      shelves: []
    }
    this.reload = this.reload.bind(this)
  }

  componentWillMount() {
    this.reload()
  }
  reload(){
    apiFetch(GET_SHELVES).then(data => {
      this.setState({ shelves: data })
      console.log(data)
    })
  }

  render() {
    let rows = []
    return (
      <Container style={styles.container}>
        <Header searchBar rounded>
          <Left>
            <Button transparent onPress={() => { this.props.navigation.navigate("DrawerOpen") }}>
              <Icon name="menu" />
            </Button>
          </Left>
          <Body>
            <Title>
              合併儲位
            </Title>
          </Body>
          <Right></Right>
        </Header>
        <Content>
        </Content>
      </Container>
    );
  }
}

export default ShelfMerge;
