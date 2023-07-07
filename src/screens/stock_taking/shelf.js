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
import { apiFetch, GET_STOCK_TAKING_SHELF,CREATE_STOCK_TAKING_ITEM } from "../../api"
import { Grid, Col, Row } from "react-native-easy-grid";
class StockTakingShelf extends Component {
  constructor(props) {
    super(props)
    const { params } = this.props.navigation.state;
    const { shop } = params

    this.state = {
      stock_taking: params.stock_taking,

    }
    this.reload = this.reload.bind(this)
    this.reload()
  }


  reload() {
    let { stock_taking } = this.state
    apiFetch(GET_STOCK_TAKING, { id: stock_taking.id }, (data) => {
      this.setState({ stock_taking: data })
    })
  }

  test(){
    <ListItem
    key={item.key}
    onPress={() => {
      this.setState({ isQuantityModalVisible: true, currentItemKey: item.key })
    }}
  >
    <Grid>
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
            <Text style={item.after_adjustment_pcs == item.before_adjustment_pcs ? styles.green : styles.orange}>{item.after_adjustment_pcs}</Text>
        }
      </Col>

    </Grid>
  </ListItem>

  }


  render() {
    let { stock_taking } = this.state

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

export default StockTakingShow;