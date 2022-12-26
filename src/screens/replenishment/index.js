
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
  Badge
} from "native-base";
import styles from "./styles";
import { apiFetch, GET_REPLENISHMENTS, } from "../../api"

import { Grid, Col, Row } from "react-native-easy-grid";


class ReplenishmentProductStorages extends Component {
  constructor(props) {
    super(props)
    this.reload = this.reload.bind(this)
    const { params } = this.props.navigation.state;
    const { storages, shop } = params

    this.state = {
      shop: shop,
      storages: storages,
    }
  }

  reload() {
    apiFetch(GET_REPLENISHMENTS, { shop_id: this.state.shop.id }, (_data) => {
      this.setState({ storages: _data[0].product_storages })
    })
  }

  render() {
    let { shop, storages } = this.state
    let result_shelves = []
    let rows = []

    for (let storage of storages) {
      let need = storage.locked_pcs - storage.replenishment_shelves.reduce((sum, shelf) => {
        shelf.total_pcs = shelf.storages.reduce((_sum, _shelf_storage) => {
          return _sum + _shelf_storage.pcs
        }, 0)
        return sum + shelf.total_pcs
      }, 0)

      storage.current_shelves = storage.current_shelves.filter(shelf => !storage.replenishment_shelves.map(_shelf => _shelf.id).includes(shelf.id))

      for (let current_shelf of storage.current_shelves) {
        current_shelf.total_pcs = current_shelf.storages.reduce((_sum, _shelf_storage) => {
          return _sum + _shelf_storage.pcs
        }, 0)
      }

      storage.replenishment_shelves.sort((a, b) => a.total_pcs - b.total_pcs)

      storage.current_shelves.sort((a, b) => b.total_pcs - a.total_pcs)

      while(need > 0 && storage.replenishment_shelves.length > 0 && storage.current_shelves.length > 0) {
        result_shelves.push({
          product: storage.product,
          product_storage: storage,
          source_shelf: Object.assign({}, storage.current_shelves[0]),
          target_shelf: Object.assign({}, storage.replenishment_shelves[0]),
        })

        need -= storage.current_shelves[0].total_pcs
        storage.replenishment_shelves = storage.replenishment_shelves.filter(shelf => shelf.id != storage.replenishment_shelves[0].id)
        storage.current_shelves = storage.current_shelves.filter(shelf => shelf.id != storage.current_shelves[0].id)
      }
    }
    let sorted_shelves = result_shelves.sort((a, b) => {
      try {
        return a.source_shelf.token.localeCompare(b.source_shelf.token);
      } catch (e) {
        return 1
      }

    })
    rows = sorted_shelves.map(shelf => {
      return <ListItem key={shelf.id} onPress={()=>{
        this.props.navigation.navigate("ReplenishmentMerge", { source_shelf: shelf.source_shelf.token ,destination_shelf: shelf.target_shelf.token,onBack: this.reload })
      }}>
        <Grid>
          <Row>
            <Col size={1}>
              <Text style={styles.float_left}>{shelf.product.uid}</Text>
            </Col>

            <Col size={1}>
              <Text style={styles.float_left}>{shelf.product.name}</Text>
            </Col>
            <Col size={1}>
              </Col>
          </Row>
          {
            shelf.product_storage.expiration_date || shelf.product_storage.batch ?
              <Row>
                <Col size={1}>
                  <Text style={styles.float_left}>{shelf.product_storage.storage_type_name}</Text>
                </Col>

                <Col size={1}>
                  <Text style={styles.float_left}>{shelf.product_storage.expiration_date}</Text>
                </Col>
                <Col size={1}>
                  <Text style={styles.float_left}>{shelf.product_storage.batch}</Text>
                </Col>
              </Row> : null
          }
          <Row >
            <Col size={1} style={styles.vertical_center}>
            <Badge
                    style={{
                      borderRadius: 3,
                      height: 25,
                      width: 100,
                      backgroundColor: "#000000"
                    }}
                    textStyle={{ color: "white" }}
                  >
              <Text style={styles.float_left}>{shelf.source_shelf.token}</Text>
              </Badge>
            </Col>
            <Col size={1} style={styles.vertical_center}>
              <Icon name="arrow-forward" style={{ color: "#999" }} />
            </Col>

            <Col size={1} style={styles.vertical_center}>
            <Badge
                    style={{
                      borderRadius: 3,
                      height: 25,
                      width: 100,
                      backgroundColor: "#000000"
                    }}
                    textStyle={{ color: "white" }}
                  >
              <Text style={styles.float_left}>{shelf.target_shelf.token}</Text>
              </Badge>
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
              }}
            >
              <Icon name="arrow-back" />
            </Button>
          </Left>
          <Body>
            <Title>{shop.name}</Title>
          </Body>
          <Right>
            <Button transparent>
              <Icon name="refresh" onPress={() => this.reload()} />
            </Button>
          </Right>

        </Header>

        <Content>
          {
            storages.length > 0 ?
              <List>
                {rows}
              </List> : null
          }
        </Content>
      </Container>
    );
  }
}

export default ReplenishmentProductStorages