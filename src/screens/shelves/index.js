
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

import * as AppActions from '../../redux/actions/AppAction'

class ShelfIndex extends Component {
  constructor(props) {
    super(props)
  }

  render() {
    const { params } = this.props.navigation.state;
    return <Container style={styles.container} >
    <Header>
      <Left>
        <Button
          transparent
          onPress={() => {
            this.props.navigation.goBack()
          }
          }
        >
        <Icon name="arrow-back" />
      </Button>
      </Left>
      <Right></Right>
    </Header>
    <Content disableKBDismissScroll={true}>
      <List>
      {
        params.shelves.map(shelf=>{
          return <ListItem key={shelf.token}>
            <Text>
              {shelf.token}
            </Text>
          </ListItem>
        })
      }    
      </List>
    </Content>

    </Container>
  }
}

export default ShelfIndex;