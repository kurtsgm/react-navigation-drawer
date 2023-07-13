import React, { Component } from "react";
import {
  Container,
  Header,
  Title,
  Content,
  Button,
  Icon,
  Left,
  Body,
  Right,
  List,
  ListItem,
  Footer,
  FooterTab,
  Text,
  Input

} from "native-base";
import styles from "./styles";
import Dialog from "react-native-dialog";
import { apiFetch, GET_STOCK_TAKING_SHELF, GET_SHELF_INFO } from "../../api"
import { Grid, Col, Row } from "react-native-easy-grid";
class StockTakingShelf extends Component {
  constructor(props) {
    super(props)
    const { params } = this.props.navigation.state;
    const { shop } = params

    this.state = {
      items: []
    }
    this.reload = this.reload.bind(this)
    this.reload()
  }


  reload() {
    const { stock_taking, stock_taking_shelf } = this.props.navigation.state.params

    apiFetch(GET_SHELF_INFO, { token: stock_taking_shelf.shelf.token,shop_id: stock_taking.shop_id }, shelf_data => {
      apiFetch(GET_STOCK_TAKING_SHELF, { stock_taking_id: stock_taking.id, id: stock_taking_shelf.id }, (data) => {
        items = shelf_data.storages.map(shelf_storage => {
          console.log(shelf_storage)
          return {
            
          }
        })
      })
    })


  }



  render() {
    const { stock_taking } = this.props.navigation.state.params
    const { items } = this.state


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
            <Title>{stock_taking.name}</Title>
          </Body>
          <Right>
            <Button transparent>
              <Icon name="refresh" onPress={() => this.reload()} />
            </Button>
          </Right>
        </Header>
        <Content>
          <List>
            {
              items.map(item => {
                return <ListItem>
                  <Grid>
                    <Row>
                      <Col size={1}>
                      </Col>
                    </Row>
                  </Grid>
                </ListItem>
              })
            }
          </List>
        </Content>
        <Footer>
          <FooterTab>
          </FooterTab>
        </Footer>
      </Container>
    );
  }
}

export default StockTakingShelf;