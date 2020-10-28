
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

class ProductStorages extends Component {
  constructor(props) {
    super(props)
  }
  render() {
    let rows = []
    let previous_type = null
    const { params } = this.props.navigation.state;
    const {storages, product} = params
    let sorted_storages = storages.sort((a,b)=>{
      return a.product_storage_type_id - b.product_storage_type_id
    })
    sorted_storages.filter(s=>s.pcs != 0).forEach(storage => {
      let storage_title = "無批號"
      if (previous_type != storage.product_storage_type_id) {
        rows.push(<ListItem itemDivider key={`divider-${storage.product_storage_type_id}`}>
          <Text>{storage.storage_type_name}</Text>
        </ListItem>)
        previous_type = storage.product_storage_type_id
      }
      if(storage.batch || storage.expiration_date){
        storage_title= [storage.batch,storage.expiration_date].filter(e=>e).join("/")
      }
      
      rows.push(<ListItem key={storage.id} button onPress={() =>
        this.props.navigation.navigate("ProductShelf",{shelf_storages: storage.shelf_storages,product: product})}>
        <Left>
          <Text>
            {`${storage_title} (${storage.pcs})`}
          </Text>
        </Left>
        <Right>
          <Icon name="arrow-forward" style={{ color: "#999" }} />
        </Right>
      </ListItem>)
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
            storages.length > 0 ?
              <List>
                {rows}
              </List> : null
          }
        </Content>
      </Container>
    );
  }
}

export default ProductStorages;