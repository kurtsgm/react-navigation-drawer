
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
import { Grid, Col, Row } from "react-native-easy-grid";


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
    apiFetch(GET_PICKING_LISTS, {}, (_data) => {
      this.setState({ picking_lists: _data })
    })
  }


  render() {
    let rows = this.state.picking_lists.map(picking_list => {
      picking_list.onBack = () => { this.reload() }
      return <ListItem key={picking_list.id} button onPress={() =>
        this.props.navigation.navigate("ShowPickingList", picking_list)}>
        <Left>
          <Row>
            <Col size={1}>
              {
                picking_list.status == "done" ?
                  <Icon name="checkmark-circle" style={{ color: "#3ADF00" }} /> : null
              }
              {
                picking_list.status == "processing" ?
                  <Icon name="flash" style={{ color: "orange" }} /> : null
              }
            </Col>
            <Col size={8}>
              <Text>
                {`${picking_list.shop_name} ${picking_list.id} [${picking_list.orders_length}]`}
              </Text>

            </Col>
          </Row>

        </Left>
        <Body>
          <Text>
            {picking_list.created_date}
          </Text>
        </Body>
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
              onPress={() => this.props.navigation.openDrawer()}
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
                <ListItem itemDivider>
                  <Left><Text>單號</Text></Left>
                  <Body><Text>日期</Text></Body>
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