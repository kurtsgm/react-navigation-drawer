
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
} from "native-base";
import { Grid, Col, Row } from "react-native-easy-grid";
import styles from "./styles";

import * as AppActions from '../../redux/actions/AppAction'
import { apiFetch, GET_HIGH_LAYER, GET_PICKING_LISTS } from "../../api"



class HighLayerShopIndex extends Component {
  constructor(props) {
    super(props)
    this.state = {
      shops: []
    }
    this.reload = this.reload.bind(this)
  }
  componentWillMount() {
    this.reload()
  }
  reload() {
    apiFetch(GET_PICKING_LISTS, {ready_to_pick: true}, (_data) => {
      let shops = {}
      for (let data of _data) {
        if (shops[data.shop_id]) {
          shops[data.shop_id].picking_lists.push(data)
        } else {
          shops[data.shop_id] = {
            picking_lists: [data],
            shop_name: data.shop_name,
          }
        }
      }
      this.setState({ shops: shops })
    })
  }


  render() {
    let rows = Object.keys(this.state.shops).map(shop_id => {
      let shop_data = this.state.shops[shop_id]
      return <ListItem key={`shop-${shop_id}`} button onPress={() =>
        this.props.navigation.navigate("HighLayerPickingLists", {onBack: () => { this.reload() }, shop_id:shop_id,shop_name: shop_data.shop_name,picking_lists: shop_data.picking_lists })}>
        <Body>
          <Text>
            {shop_data.shop_name}
          </Text>
        </Body>
        <Right>
          <Button disabled={true} primary transparent>
            <Text>
              {shop_data.picking_lists.length}
            </Text>
            <Icon name="arrow-forward" style={{ color: "#999" }} />
          </Button>

        </Right>

      </ListItem>
    })


    return (
      <Container style={styles.container}>
        <Header>
          <Left>
            <Button
              transparent
              onPress={() => this.props.navigation.openDrawer()}
            >
              <Icon name="menu" />
            </Button>
          </Left>
          <Body>
            <Title>高空待撿</Title>
          </Body>
          <Right>
            <Button transparent>
              <Icon name="refresh" onPress={() => this.reload()} />
            </Button>
          </Right>
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

export default HighLayerShopIndex;