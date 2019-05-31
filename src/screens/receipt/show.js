import React, { Component } from "react";
import { View } from 'react-native';
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
  Input,
  List,
  ListItem,
  Toast,
  CheckBox
} from "native-base";

import Dialog from "react-native-dialog";

import { Grid, Col, Row } from "react-native-easy-grid";
import { apiFetch, GET_RECEIPT, RECEIVE_RECEIPT, RECOMMEND_SHELF } from "../../api"
import styles from "./styles";



class ShowReceipt extends Component {
  constructor(props) {
    super(props)
    const { receipt } = this.props.navigation.state.params;
    this.state = {
      receipt_id: receipt.id,
      receipt_title: receipt.title,
      isModalVisible: false,
      currentItemId: null,
      items: receipt.items.map((item) => {
        return Object.assign({}, item, { ready_to_receive: 0 })
      }),
      barcode: null,
      all_checked: false
    }
    this.recommend = this.recommend.bind(this)
    this.reload = this.reload.bind(this)
    this.onReceived = this.onReceived.bind(this)
    this.item_count = this.item_count.bind(this)
    this.toggleAll = this.toggleAll.bind(this)
  }

  toggleAll() {
    let items = this.state.items
    for (let item of items) {
      item.ready_to_receive = this.state.all_checked ? 0 : item.box_count - item.received_count
    }
    this.setState({ items: items, all_checked: !this.state.all_checked })
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
        receipt_title: data.title,
        items: data.items.map((item) => {
          return Object.assign({}, item, { ready_to_receive: 0 })
        })
      })
      this.props.navigation.state.params.onReceiptUpdate(data)
    });
  }
  onReceived() {
    Toast.show({
      text: '已成功入庫',
      duration: 2500,
      textStyle: { textAlign: "center" }
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
        Toast.show({
          text: data.message,
          duration: 2500,
          textStyle: { textAlign: "center" }
        })

      }
    });
  }
  render() {
    console.log(this.state)
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
            <Title>{this.state.receipt_title}</Title>
          </Body>
          <Right>
            <Button transparent>
              <Icon name="refresh" onPress={() => this.reload()} />
            </Button>
          </Right>
        </Header>
        <Content>
          <Dialog.Container visible={this.state.isModalVisible}>
            <Dialog.Title>請輸入數量</Dialog.Title>
            <Dialog.Input keyboardType='numeric'
              placeholder='請輸入數量'
              autoFocus={true}
              onEndEditing={(event) => {
                this.setState({ isModalVisible: false })
                console.log(event.nativeEvent.text)
                let items = this.state.items
                for (item of items) {
                  if (item.id == this.state.currentItemId) {
                    item.ready_to_receive = parseInt(event.nativeEvent.text)
                    if (item.ready_to_receive > (item.box_count - item.received_count)) {
                      item.ready_to_receive = item.box_count - item.received_count
                      Toast.show({
                        text: `最多可輸入${item.ready_to_receive}箱`,
                        duration: 2500,
                        textStyle: { textAlign: "center" }
                      })
                    }
                    break
                  }
                }
                this.setState({ items: items })
              }}
              returnKeyType="done" />
            <Dialog.Button label="取消" onPress={() => this.setState({ isModalVisible: false })} />
          </Dialog.Container>

          <List>
            <ListItem>
              <Grid>
                <Col size={6} style={styles.vertical_center} >
                  <Text>選擇全部</Text>
                </Col>
                <Col size={1} style={styles.vertical_center} >
                  <CheckBox checked={this.state.all_checked}
                    onPress={() => {
                      this.toggleAll()
                    }} />
                </Col>
              </Grid>
            </ListItem>
            <ListItem>
              <Grid>
                <Col size={6} style={styles.vertical_center} >
                  <Input placeholder="請輸入或者掃描條碼" autoFocus={false}
                    value={this.state.barcode}
                    returnKeyType="done"
                    onChangeText={(text) => this.setState({ barcode: text })}
                    onEndEditing={
                      (event) => {
                        let barcode = event.nativeEvent.text.trim()
                        this.setState({barcode:barcode})
                      }
                    } />

                </Col>
                <Col size={1} style={styles.vertical_center} >
                  <Button
                    transparent
                    onPress={() =>
                      this.props.navigation.navigate("BarcodeScanner", {
                        onBarcodeScanned: (barcode) => {
                          this.setState({ barcode: barcode })
                        }
                      }
                      )
                    }
                  >
                    <Icon name="camera" />
                  </Button>
                </Col>
              </Grid>
            </ListItem>
            {this.state.items.filter((item)=>{
              return this.state.barcode ?
              item.product_barcode && item.product_barcode.toUpperCase().includes(this.state.barcode.toUpperCase())
              || item.product_uid && item.product_uid.toUpperCase().includes(this.state.barcode.toUpperCase())
               : true
            }).map(data => {
              return <ListItem key={data.id}>
                <Grid>
                  <Col size={4} style={styles.vertical_center} >
                    <Row>
                      <Text style={styles.storage_title} >
                        {data.product_name + " " + data.storage_type_name + " [" + data.pcs_per_box + "入]"}
                      </Text>
                    </Row>
                    <Row>
                      <Text>
                        {[data.product_uid, data.expiration_date, data.batch].filter(e => e).join('/')}
                      </Text>
                    </Row>

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
                        this.setState({ isModalVisible: true, currentItemId: data.id })
                      }}>
                        {data.ready_to_receive > 0 ?
                          <Text>{data.ready_to_receive}</Text> :
                          <Icon name="remove" />}
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
