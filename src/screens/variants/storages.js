
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

class VariantStorages extends Component {
  constructor(props) {
    super(props)    
  }
  render() {
    let rows = []
    const { params: storages } = this.props.navigation.state;
    console.log(storages)
    rows = storages.map((storage) => {
      return  <ListItem key={storage.id} button onPress={() => 
          this.props.navigation.navigate("ShowReceipt",receipt)}>
          <Left>
            <Text>
            </Text>
          </Left>
          <Right>
            <Icon name="arrow-forward" style={{ color: "#999" }} />
          </Right>
        </ListItem>
    })

    return (
      <Container style={styles.container}>
        <Header>
          <Left>
            <Button
              transparent
              onPress={() => this.props.navigation.navigate("DrawerOpen")}
            >
              <Icon name="menu" />
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

export default VariantStorages;