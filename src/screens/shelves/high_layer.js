
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
import { apiFetch, GET_HIGH_LAYER } from "../../api"



class HighLayerShelf extends Component {
  constructor(props) {
    super(props)
    this.state = {
      high_layers: []
    }
    this.reload = this.reload.bind(this)
  }
  componentWillMount() {
    this.reload()
  }
  reload() {
    apiFetch(GET_HIGH_LAYER,{},(_data) => {
      console.log(_data)
    })
  }


  render() {
    let rows = this.state.high_layers.map(shelf=>{
      return <ListItem key={shelf.id} >{shelf.token}</ListItem>
      // shelf.onBack = ()=>{this.reload()}
      // return <ListItem key={shelf.id} button onPress={() =>
      //   this.props.navigation.navigate("ShowPickingList",picking_list)}>
      //   <Left>
      //     <Text>
      //       {`${picking_list.shop_name} ${picking_list.id} [${picking_list.orders_length}]`}
      //     </Text>
      //   </Left>
      //   <Right>
      //     <Icon name="arrow-forward" style={{ color: "#999" }} />
      //   </Right>
      // </ListItem>
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
            this.state.high_layers.length > 0 ?
              <List>
                {rows}
              </List> : null
          }
        </Content>
      </Container>
    );
  }
}

export default HighLayerShelf;