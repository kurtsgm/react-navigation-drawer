
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
import { shelfSorter } from '../../common'

class ProductShelf extends Component {
  constructor(props) {
    super(props)    
  }
  render() {
    const { params: shelve_storages } = this.props.navigation.state;
    let rows = shelve_storages.sort((a, b) => {
      return a.shelf.token.localeCompare(b.shelf.token)
    }).map((shelve_storage,index)=>{
      return <ListItem key={`${index}${shelve_storage.shelf.token}`}>
        <Left>
          <Text>
            {shelve_storage.shelf.token}
          </Text>
        </Left>
        <Right>
          <Text>
            {shelve_storage.pcs}
          </Text>
        </Right>
      </ListItem>
    })
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
            <Title></Title>
          </Body>
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

export default ProductShelf;