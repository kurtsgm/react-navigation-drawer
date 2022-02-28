
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
} from "native-base";
import styles from "./styles";

import { apiFetch, GET_REPLENISHMENTS, } from "../../api"



class ReplenishmentShopIndex extends Component {
  constructor(props) {
    super(props)
    this.state = {
      shops: []
    }
    this.reload = this.reload.bind(this)
    this.reload()
  }
  reload() {
    apiFetch(GET_REPLENISHMENTS,{}, (_data) => {
      this.setState({ shops: _data })
    })
  }


  render() {
    let rows = this.state.shops.map(shop_data => {
      return <ListItem key={`shop-${shop_data.shop.id}`} button onPress={() =>
        this.props.navigation.navigate("ReplenishmentProductStorages", {onBack: () => { this.reload() }, shop: shop_data.shop,storages: shop_data.product_storages })}>
        <Body>
          <Text>
            {shop_data.shop.name}
          </Text>
        </Body>
        <Right>
          <Button disabled={true} primary transparent>
            <Icon name="arrow-forward" style={{ color: "#999" }} />
          </Button>

        </Right>

      </ListItem>
    })


    return (
      <Container style={styles.container}>
        <Header>
          <Left>
            <Button
              transparent
              onPress={() => this.props.navigation.openDrawer()}
            >
              <Icon name="menu" />
            </Button>
          </Left>
          <Body>
            <Title>揀補作業</Title>
          </Body>
          <Right>
            <Button transparent>
              <Icon name="refresh" onPress={() => this.reload()} />
            </Button>
          </Right>
        </Header>

        <Content>
          {
            rows.length > 0 ?
              <List>
                {rows}
              </List> : null
          }
        </Content>
      </Container>
    );
  }
}

export default ReplenishmentShopIndex;