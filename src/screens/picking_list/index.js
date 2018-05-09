
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
import { apiFetch, GET_PICKING_LISTS } from "../../api"



class PickingLists extends Component {
  constructor(props) {
    super(props)
    this.state = {
      picking_lists: []
    }
    this.reload = this.reload.bind(this)
  }
  componentWillMount() {
    this.reload()
  }
  reload() {
    apiFetch(GET_PICKING_LISTS,{},(_data) => {
      this.setState({ picking_lists: _data })
    })
  }

  render() {
    let previous_date = null
    let rows = this.state.picking_lists.map(picking_list=>{
      return <ListItem key={picking_list.id} button onPress={() =>
        this.props.navigation.navigate("ShowPickingList",picking_list)}>
        <Left>
          <Text>
            {`${picking_list.shop_name} ${picking_list.id} [${picking_list.orders.length}]`}
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
            <Title>揀貨作業</Title>
          </Body>
          <Right>
            <Button transparent>
              <Icon name="refresh" onPress={() => this.reload()} />
            </Button>
          </Right>
        </Header>

        <Content>
          {
            this.state.picking_lists.length > 0 ?
              <List>
                {rows}
              </List> : null
          }
        </Content>
      </Container>
    );
  }
}

export default PickingLists;