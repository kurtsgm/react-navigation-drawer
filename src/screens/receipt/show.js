import React, { Component } from "react";
import { View , Picker} from 'react-native';
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
  ActionSheet,
  Footer,
  Toast
} from "native-base";


import { Grid, Col } from "react-native-easy-grid";
import { apiFetch, GET_RECEIPT, RECEIVE_RECEIPT, RECOMMEND_SHELF } from "../../api"
import styles from "./styles";



class ShowReceipt extends Component {
  constructor(props) {
    super(props)
    const { receipt } = this.props.navigation.state.params;
    this.state = {
      receipt_id: receipt.id,
      receipt_title: receipt.barcode,
      items: receipt.items.map((item) => {
        return {
          ready_to_receive: 0,
          id: item.id,
          product_name: item.product_name,
          storage_type_name: item.storage_type_name,
          received_count: item.received_count,
          box_count: item.box_count,
          pcs_per_box: item.pcs_per_box
        }
      }),
    }
    this.recommend = this.recommend.bind(this)
    this.reload = this.reload.bind(this)
    this.onReceived = this.onReceived.bind(this)
    this.item_count = this.item_count.bind(this)
  }

  item_count() {
    return this.state.items.reduce((sum, item) => sum + item.ready_to_receive, 0)
  }

  reload() {
    apiFetch(GET_RECEIPT, {
      id: this.state.receipt_id,
    }, (data) => {
      this.setState({
        receipt_id: data.id,
        receipt_title: data.barcode,
        items: data.items.map((item) => {
          return {
            ready_to_receive: 0,
            id: item.id,
            product_name: item.product_name,
            storage_type_name: item.storage_type_name,
            received_count: item.received_count,
            box_count: item.box_count,
            pcs_per_box: item.pcs_per_box
          }
        })
      })
      this.props.navigation.state.params.onReceiptUpdate(data)
    });
  }
  onReceived() {
    Toast.show({
      text: '已成功入庫',
      duration: 2500,
      textStyle: {textAlign: "center"}
    })

    this.reload()
  }

  recommend() {
    items = this.state.items.map((item) => {
      if (item.ready_to_receive > 0) {
        return { id: item.id, quantity: item.ready_to_receive }
      }
    }).filter(Boolean);
    apiFetch(RECOMMEND_SHELF, {
      id: this.state.receipt_id,
      items: items
    }, (data) => {
      if (data.status == "success") {
        this.props.navigation.navigate("RecommendShelf",
          {
            items: this.state.items.filter((item) => item.ready_to_receive > 0),
            receipt_id: this.state.receipt_id,
            shelf: data.shelf,
            onReceived: this.onReceived
          })
      } else {
        console.log(data)
      }
    });
  }
  render() {
    return (
      <Container style={styles.container}>
        <Header>
          <Left>
            <Button
              transparent
              onPress={() => this.props.navigation.goBack()}
            >
              <Icon name="arrow-back" />
            </Button>
          </Left>
          <Body>
            <Title>{this.state.receipt_title}</Title>
          </Body>
          <Right>
            <Button transparent>
              <Icon name="refresh" onPress={() => this.reload()} />
            </Button>
          </Right>
        </Header>
        <Content>
          <List>
            {this.state.items.map(data => {
              return <ListItem key={data.id}>
                <Grid>
                  <Col size={4} style={styles.vertical_center} >
                    <Text style={styles.storage_title} >
                      {data.product_name + " " + data.storage_type_name + " [" + data.pcs_per_box + "入]"}
                    </Text>
                  </Col>
                  <Col size={2} style={styles.vertical_center} >
                    <Text>
                      {data.received_count + "/" + data.box_count}
                    </Text>
                  </Col>
                  <Col size={2} style={styles.vertical_center} >
                    {data.received_count == data.box_count ?
                      null
                      :
                      <Button bordered light block primary onPress={() => {
                        let quantities = [...Array(data.box_count - data.received_count + 1)].map((v, index) => index.toString())
                        ActionSheet.show(
                          {
                            options: quantities,
                            title: "點收數量"
                          },
                          buttonIndex => {
                            items = this.state.items
                            for (item of items) {
                              if (item.id == data.id) {
                                item.ready_to_receive = buttonIndex
                                break
                              }
                            }
                            this.setState({ items: items })
                          }
                        )
                      }}>
                        {data.ready_to_receive > 0 ?
                          <Text>{data.ready_to_receive}</Text> :
                          <Icon name="checkmark" />}
                      </Button>
                    }
                  </Col>
                </Grid>
              </ListItem>
            })
            }
          </List>
        </Content>
        {
          this.item_count() > 0 ?
            <View style={styles.footer}>
              <Button primary full style={styles.mb15} onPress={() => {
                this.recommend()
              }}>
                <Text>建議儲位</Text>
              </Button>
            </View>
            : null

        }
      </Container>
    );
  }
}

export default ShowReceipt;
