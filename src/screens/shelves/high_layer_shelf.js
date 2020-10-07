
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
import { apiFetch, GET_HIGH_LAYER } from "../../api"



class HighLayerShelf extends Component {
  constructor(props) {
    super(props)
    this.state = {
      shop_name: this.props.navigation.state.params.shop_name,
      shop_id: this.props.navigation.state.params.shop_id,
      picking_list_ids: this.props.navigation.state.params.picking_list_ids,
      high_layers: []
    }
    this.reload = this.reload.bind(this)
    this.reload()
  }
  reload() {
    apiFetch(GET_HIGH_LAYER, {shop_id: this.state.shop_id,picking_list_ids:this.state.picking_list_ids}, (_data) => {
      this.setState({ high_layers: _data })
    })
  }

  render() {
    let rows = this.state.high_layers.map(shelf => {
      shelf.onBack = () => { this.reload() }
      return <ListItem key={`${shelf.shelf_id}-${shelf.product}-${shelf.storage_type_name}`} button onPress={() =>
        this.props.navigation.navigate("HighLayerShelfMerge", { high_layer: shelf })}>
        <Grid>
          <Col size={3} style={styles.vertical_center} >
            <Text>
              {shelf.shelf_token}
            </Text>
          </Col>
          <Col size={5} style={styles.vertical_center} >
            <Text>
              {`${shelf.product}/${shelf.storage_type_name}`}

            </Text>
          </Col>
          <Col size={4} style={styles.vertical_center} >
            <Button disabled={true} primary transparent>
              <Text>
                {shelf.shelf_quantity}
              </Text>
              <Icon name="arrow-forward" style={{ color: "#999" }} />
            </Button>
          </Col>
        </Grid>
      </ListItem>
    })


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
            <Title>{`${this.state.shop_name} 高空待撿`}</Title>
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

export default HighLayerShelf;