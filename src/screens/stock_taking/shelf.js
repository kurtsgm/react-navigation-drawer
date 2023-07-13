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

    apiFetch(GET_SHELF_INFO, { token: stock_taking_shelf.shelf.token, shop_id: stock_taking.shop_id }, shelf_data => {
      apiFetch(GET_STOCK_TAKING_SHELF, { stock_taking_id: stock_taking.id, id: stock_taking_shelf.id }, (stock_taking_items) => {
        items = shelf_data.storages
        console.log(stock_taking_items)
        for(let item of items){
          let stock_taking_item = stock_taking_items.find(e => e.product_storage_id == item.product_storage_id)
          if(stock_taking_item){
            item.before_adjustment_pcs = stock_taking_item.before_adjustment_pcs
            item.after_adjustment_pcs = stock_taking_item.after_adjustment_pcs
          }else{
            item.before_adjustment_pcs = item.pcs
            item.after_adjustment_pcs = null
          }
        }
        this.setState({ items })
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
                        <Text>{`${item.product_storage.product.uid}\n${item.product_storage.product.name}`}</Text>
                      </Col>
                      <Col size={1}>
                        <Text>
                          {[
                            item.product_storage.storage_type_name,
                            item.product_storage.expiration_date,
                            item.product_storage.batch
                          ].filter(e => e).join("\n")}
                        </Text>
                      </Col>
                      <Col size={1}>
                        {
                          item.after_adjustment_pcs == null ? <Text>{`${item.before_adjustment_pcs}\n未盤`}</Text> :
                            <Text style={item.after_adjustment_pcs == item.before_adjustment_pcs ? styles.green : styles.orange}>{`${item.after_adjustment_pcs} / ${item.before_adjustment_pcs}`}</Text>
                        }
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