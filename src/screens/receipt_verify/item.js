
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
import { apiFetch ,GET_RECEIPT_ITEM} from "../../api"



class ReceiptVerifyItem extends Component {
  constructor(props) {
    super(props)
    this.reload = this.reload.bind(this)
  }
  reload(){
    const { item_id,receipt_id } = this.props.navigation.state.params;
    console.log(`item_id: ${item_id}`)
    apiFetch(GET_RECEIPT_ITEM, { receipt_id: receipt_id,id: item_id}, (_data) => {
      // this.setState({ items: _data.items })
      console.log(_data)
    })    
  }
  componentWillMount() {
    this.reload()
  }
  render() {
    return (
      <Container style={styles.container}>
        <Header>
          <Left>
          <Button
              transparent
              onPress={() => {
                this.props.navigation.state.params.onBack()
                this.props.navigation.goBack()
              }
              }
            >
              <Icon name="arrow-back" />
            </Button>
          </Left>
          <Body>
            <Title>品項驗收</Title>
          </Body>
          <Right>
            <Button transparent>
              <Icon name="refresh" onPress={() => this.reload()} />
            </Button>
          </Right>
        </Header>

        <Content>
        </Content>
      </Container>
    );
  }
}
export default ReceiptVerifyItem