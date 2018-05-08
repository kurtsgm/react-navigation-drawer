
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

    apiFetch(GET_SHELF_INFO, { token: this.state.shelf.token }).then(data => {
      this.setState({shelf:data})
    })  
  }
  render() {
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
            <Text>
            {this.state.shelf.token}
            </Text>
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
                  this.state.shelf.storages.map(storage => {

                    return <ListItem key={storage.id} button onPress={() => {
                      this.props.navigation.navigate("ShelfProduct",{storage: storage, reload: this.reload,shelf_token:this.state.shelf.token})                    
                    }}>
                      <Left>
                        <Text>
                          {
                            [
                              storage.product_storage.product.name,
                              storage.product_storage.storage_type_name,
                              storage.product_storage.expiration_date
                            ].filter(e => e).join("/")
                          }
                        </Text>
                      </Left>
                      <Text style={styles.blue}>
                        {storage.pcs}
                      </Text>
                      <Right>
                      <Icon name="arrow-forward" style={{ color: "#999" }} />
                      </Right>
                    </ListItem>
                  })
                }
              </List> : null
          }
        </Content>
      </Container>
    );
  }
}

export default ShelfShow;