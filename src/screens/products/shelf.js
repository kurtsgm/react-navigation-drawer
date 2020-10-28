
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
    const { params } = this.props.navigation.state;
    const {shelf_storages ,product} = params
    let rows = shelf_storages.sort((a, b) => {
      return a.shelf.token.localeCompare(b.shelf.token)
    }).map((shelf_storage,index)=>{
      let box_count = product.default_pcs && product.default_pcs > 0 ? Math.floor(shelf_storage.pcs / product.default_pcs) : null
      return <ListItem key={`${index}${shelf_storage.shelf.token}`}>
        <Left>
          <Text>
            {shelf_storage.shelf.token}
          </Text>
        </Left>
        <Right>
          <Text>
            {shelf_storage.pcs}
            {
              box_count ? `\n${box_count} 箱 / ${shelf_storage.pcs % product.default_pcs} 散` : ''
            }
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