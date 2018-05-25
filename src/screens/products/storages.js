
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
    const { params: storages } = this.props.navigation.state;
    console.log(storages)
    let sorted_storages = storages.sort((a,b)=>{
      return a.storage_type != "normal" && a.storage_type > b.storage_type
    })
    sorted_storages.forEach(storage => {
      let storage_title = "無批號"
      if (previous_type != storage.storage_type) {
        rows.push(<ListItem itemDivider key={storage.storage_type}>
          <Text>{storage.storage_type_name}</Text>
        </ListItem>)
        previous_type = storage.storage_type
      }
      if(storage.batch || storage.expiration_date){
        storage_title= [storage.batch,storage.expiration_date].filter(e=>e).join("/")
      }

      rows.push(<ListItem key={storage.id} button onPress={() => 
        this.props.navigation.navigate("ProductShelf",storage.shelf_storages)}>
        <Left>
          <Text>
            {storage_title+" ("+ storage.pcs+")"}
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