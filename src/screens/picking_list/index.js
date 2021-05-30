
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
  Badge,
  ListItem,
  ButtonGroup
} from "native-base";

import { hashColor } from '../../common'

import styles from "./styles";

import * as AppActions from '../../redux/actions/AppAction'
import { apiFetch, GET_PICKING_LISTS } from "../../api"
import { Grid, Col, Row } from "react-native-easy-grid";


class PickingLists extends Component {
  constructor(props) {
    super(props)
    const { params } = this.props.navigation.state;
    this.state = {
      picking_lists: [],
      shop_id: params.shop_id,
      shop_name: params.shop_name
    }
    this.reload = this.reload.bind(this)
    this.reload()
  }
  reload() {
    apiFetch(GET_PICKING_LISTS, { shop_id: this.state.shop_id }, (_data) => {
      this.setState({ picking_lists: _data })
    })
  }


  render() {
    let rows = this.state.picking_lists.map(picking_list => {
      picking_list.onBack = () => { this.reload() }
      return <ListItem key={picking_list.id} >
        <Grid>
          <Row>
            <Col size={1}>
              {
                picking_list.status == "done" ?
                  <Icon name="checkmark-circle" style={{ color: "#3ADF00" }} /> : null
              }
              {
                picking_list.status == "terminated" ?
                  <Icon name="checkmark-circle" style={{ color: "red" }} /> : null
              }

              {
                picking_list.status == "processing" ?
                  <Icon name="flash" style={{ color: "orange" }} /> : null
              }
            </Col>
            <Col size={4}>

              <Text>
                {`${picking_list.id} [${picking_list.orders_length}] ${picking_list.parent_id ? "\n(母批次: " + picking_list.parent_id + ")" : ''}`}
                {"\n"}
                {picking_list.channels.join("/")}
              </Text>

            </Col>
            <Col size={4}>
              <Text>
                {picking_list.close_date}
              </Text>

              {
                picking_list.shipping_types.map(shipping_type => {
                  return <Badge key={shipping_type}
                    style={{
                      height: 25,
                      backgroundColor: hashColor(shipping_type)
                    }}
                    textStyle={{ color: "white" }}>
                    <Text>{shipping_type}</Text>
                  </Badge>
                })
              }
            </Col >
            <Col size={5}  style={{ flexDirection: 'row',flex: 'right' }}>
              <Button button  bordered  onPress={() =>
                this.props.navigation.navigate("ShowPickingList", picking_list)}>

                <Text>揀貨</Text></Button>
              <Button button  bordered onPress={() =>
                this.props.navigation.navigate("PickingListQC", picking_list)}>

                <Text>QC</Text>

              </Button>
            </Col>
          </Row>
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
            <Title>{`揀貨-${this.state.shop_name}`}</Title>
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
                <ListItem itemDivider>
                  <Left><Text>單號</Text></Left>
                  <Body><Text>出倉日</Text></Body>
                  <Right></Right>
                </ListItem>
                {rows}
              </List> : null
          }
        </Content>
      </Container>
    );
  }
}

export default PickingLists;