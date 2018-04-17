
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

class ShelfShow extends Component {
  constructor(props) {
    super(props)
  }
  render() {
    const { params: shelf } = this.props.navigation.state;

    console.log(shelf)
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
              廠商名稱：{shelf.shop_name}
            </Title>
          </Body>
        </Header>

        <Content>
          {
            shelf.storages.length > 0 ?
              <List>
                {
                  shelf.storages.map(storage => {

                    return <ListItem key={storage.id} button onPress={() => {
                      // this.props.navigation.navigate("ProductShelf",storage.shelf_storages)
                    }
                    }>
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