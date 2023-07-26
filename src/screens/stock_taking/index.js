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
import { Grid, Col, Row } from "react-native-easy-grid";

import { apiFetch, GET_STOCK_TAKINGS } from "../../api"

class StockTakingIndex extends Component {
  constructor(props) {
    super(props)
    const { params } = this.props.navigation.state;

    this.state = {
      stock_takings: [],
    }
    this.reload = this.reload.bind(this)
    this.onBack = this.onBack.bind(this)
    this.reload()
  }

  reload() {
    apiFetch(GET_STOCK_TAKINGS, {
      reporter: true
    }, (data) => {
      console.log(data)
      this.setState({
        stock_takings: data
      })
    })
  }

  onBack() {
    this.reload()
  }
  render() {
    let rows = []
    let {stock_takings} = this.state
    for (let stock_taking of stock_takings) {
      rows.push(
        <ListItem key={stock_taking.id} button onPress={() => {
          this.props.navigation.navigate("StockTakingShow", { stock_taking: stock_taking, onBack: this.onBack })
        }
        }>
          <Grid>
            <Row>
              <Col size={5}>
                <Text>
                  {stock_taking.name}
                </Text>
              </Col>
              <Col size={5}>
                <Text>
                  {stock_taking.shops.map(e => e.name).join(',')}
                </Text>
              </Col>
              <Col size={1}>
              <Icon name="arrow-forward" style={{ color: "#999" }} />
              </Col>
            </Row>
          </Grid>

        </ListItem>)
    }

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
          <Right>
            <Button transparent>
              <Icon name="refresh" onPress={() => this.reload()} />
            </Button>
          </Right>
        </Header>
        <Content>
          {
            this.state.stock_takings.length > 0 ?
              <List>
                <ListItem itemDivider>
                  <Grid>
                    <Row>
                      <Col size={5}>
                        <Text>
                          盤點單號
                        </Text>
                      </Col>
                      <Col size={5}>
                        <Text>
                          客戶名稱
                        </Text>
                      </Col>
                      <Col size={1}>
                      </Col>
                    </Row>
                  </Grid>
                </ListItem>
                {rows}
              </List> : null
          }
        </Content>
      </Container>
    );
  }
}

export default StockTakingIndex;