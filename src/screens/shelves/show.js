
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
  Card,
  CardItem
} from "native-base";
import styles from "./styles";

import { apiFetch, GET_SHELF_INFO } from "../../api"

class ShelfShow extends Component {
  constructor(props) {
    super(props)
    const { params: shelf } = this.props.navigation.state;
    this.state = {
      shelf: shelf
    }
    this.reload = this.reload.bind(this)
  }


  reload(){

    apiFetch(GET_SHELF_INFO, { token: this.state.shelf.token },data => {
      this.setState({shelf:data})
    })
  }
  render() {
    let rows = []
    let previous_shop = null
    for(let storage of this.state.shelf.storages.sort((storage_a,storage_b)=>storage_a.product_storage.shop_id-storage_b.product_storage.shop_id)){
      if (previous_shop != storage.product_storage.shop_id) {
        rows.push(<ListItem itemDivider key={`divider-${storage.product_storage.shop_id}`}>
          <Text>{storage.product_storage.shop_name}</Text>
        </ListItem>)
        previous_shop = storage.product_storage.shop_id
      }      
      rows.push(<ListItem key={storage.id} button onPress={() => {
        this.props.navigation.navigate("ShelfProduct",{storage: storage, reload: this.reload,shelf_token:this.state.shelf.token})
      }}>
        <Left>
          <Text>
              {`${storage.product_storage.product.name}\n${storage.product_storage.product.barcode}\n${[
                  storage.product_storage.storage_type_name,
                  storage.product_storage.expiration_date,
                  storage.product_storage.batch
                ].filter(e => e).join("/")
              }`}                          
          </Text>
        </Left>
        <Body>
        <Text style={styles.blue}>
          {storage.pcs}
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
              onPress={() => this.props.navigation.goBack()}
            >
              <Icon name="arrow-back" />
            </Button>
          </Left>
          <Body>
            <Title>
            {this.state.shelf.token}
            </Title>
          </Body>
          <Right>
            <Title>
              {this.state.shelf.shop_name}
            </Title>

          </Right>
        </Header>
        <Content>
          {
            this.state.shelf.storages.length > 0 ?
              <List>
                {
                  rows
                }
              </List> : null
          }
        </Content>
      </Container>
    );
  }
}

export default ShelfShow;