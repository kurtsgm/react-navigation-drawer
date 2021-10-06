import React, { Component } from "react";
import { View, Alert } from 'react-native';
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
  Footer,
  FooterTab,
  CheckBox,
  Badge
} from "native-base";

import {temperatureColor} from '../../common'
import Dialog from "react-native-dialog";

import { Grid, Col, Row } from "react-native-easy-grid";
import { apiFetch, GET_RECEIPT, RECEIVE_RECEIPT, CLOSE_RECEIPT,RECOMMEND_SHELF ,GET_PRODUCTS} from "../../api"
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
      items: [],
      barcode: null,
      batch_mode: false,
      all_checked: false,
      isNewItemModalVisible: false
    }
    this.recommend = this.recommend.bind(this)
    this.reload = this.reload.bind(this)
    this.onReceived = this.onReceived.bind(this)
    this.item_count = this.item_count.bind(this)
    this.toggleAll = this.toggleAll.bind(this)
    this.setBatchMode = this.setBatchMode.bind(this)
    this.singleModeRender = this.singleModeRender.bind(this)
    this.batchModeRender = this.batchModeRender.bind(this)
    this.barcodeInput = this.barcodeInput.bind(this)
    this.addNewItem = this.addNewItem.bind(this)
    this.close = this.close.bind(this)
    this.reload()

  }
  setBatchMode(isBatch) {
    this.setState({ batch_mode: isBatch })
  }

  addNewItem() {
    const { receipt } = this.props.navigation.state.params;
    apiFetch(GET_PRODUCTS, { barcode: this.state.new_item_uid, shop_id: receipt.shop_id }, (_data) => {
      if (_data.length > 0) {
        product = _data[0]
        this.props.navigation.navigate("ReceiptVerifyItem", { receipt_id: receipt.id, new_item: product, onBack: ()=>this.reload() })
      }
      else {
        Toast.show({
          text: '錯誤，查無此品項',
          duration: 2500,
          type: 'danger',
          position: "top",
          textStyle: { textAlign: "center" }
        })
      }
    })
  }

  barcodeInput() {
    return <ListItem>
      <Grid>
        <Col size={6} style={styles.vertical_center} >
          <Input placeholder="請輸入或者掃描條碼" autoFocus={false}
            value={this.state.barcode}
            returnKeyType="done"
            onChangeText={(text) => this.setState({ barcode: text })}
            onEndEditing={
              (event) => {
                let barcode = event.nativeEvent.text.trim()
                this.setState({ barcode: barcode })
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
  }

  batchModeRender() {
    return <Content>
      <List>
        {this.barcodeInput()}
        <ListItem itemDivider key='header'>
          <Grid>
            <Col size={5} style={styles.vertical_center} >
              <Text>商品資訊</Text>
            </Col>
            <Col size={2} style={styles.vertical_center} >
              <Text>待入PCS</Text>
            </Col>
            <Col size={3} style={styles.vertical_center} >
              <Text>待入板數</Text>
            </Col>

          </Grid>
        </ListItem>
        {this.state.items.filter((item) => {
          return this.state.barcode ?
            item.product_barcode && item.product_barcode.toUpperCase().includes(this.state.barcode.toUpperCase())
            || item.product_uid && item.product_uid.toUpperCase().includes(this.state.barcode.toUpperCase())
            || item.product_name && item.product_name.toUpperCase().includes(this.state.barcode.toUpperCase())
            : true
        }).map(item => {
          let valid_stack = false
          if (item.stack_base && item.stack_level) {
            valid_stack = true
            stack_count = Math.ceil((item.verified_pcs - item.received_pcs) / (item.pcs_per_box * item.stack_base * item.stack_level))
          }
          return <ListItem key={item.id} onPress={() => valid_stack ?
            this.props.navigation.navigate("BatchReceipt", { onBack: this.reload, item: item }) : null}>
            <Grid>
              <Col size={5} style={styles.vertical_center} >
                <Row>
                  {item.verified_pcs == item.received_pcs ?
                    <Icon name="checkmark-circle" style={{ color: "#3ADF00" }} /> : null}
                  <Text style={styles.storage_title} >
                    {item.product_name + " " + item.storage_type_name + " [" + item.pcs_per_box + "入]"}
                  </Text>
                </Row>
                <Row>
                  <Text>
                    {[item.product_uid, item.expiration_date, item.batch].filter(e => e).join('/')}
                  </Text>
                </Row>
                <Row>
                  <Text style={{color: temperatureColor(item.product_temperature)}}>
                    {item.product_temperature}
                  </Text>
                </Row>
              </Col>
              <Col size={2} style={styles.vertical_center} >
                <Text>
                  {item.verified_pcs - item.received_pcs}
                </Text>
              </Col>
              {
                valid_stack ?
                  <Col size={2} style={styles.vertical_center} >
                    <Text>
                      {stack_count}
                    </Text>
                  </Col> : <Col size={3} style={styles.vertical_center} >
                    <Text style={styles.text_dark_red}>
                      {`無法估算\n(欠缺底高)`}
                    </Text>
                  </Col>

              }
              {
                valid_stack ? <Col size={1} style={styles.vertical_center} >
                  <Icon name="arrow-forward" style={{ color: "#999" }} />
                </Col> : null
              }

            </Grid>
          </ListItem>
        })
        }
      </List>
    </Content>
  }
  singleModeRender() {
    return <Content>
      <Dialog.Container visible={this.state.isModalVisible}>
        <Dialog.Title>請輸入數量</Dialog.Title>
        <Dialog.Input keyboardType='numeric'
          placeholder='請輸入數量'
          autoFocus={true}
          onEndEditing={(event) => {
            this.setState({ isModalVisible: false })
            let items = this.state.items
            for (let item of items) {
              if (item.id == this.state.currentItemId) {
                item.ready_to_receive = parseInt(event.nativeEvent.text)
                if (item.ready_to_receive > (item.verified_box_count - item.received_count)) {
                  item.ready_to_receive = item.verified_box_count - item.received_count
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
        {this.barcodeInput()}
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
        {this.state.items.filter((item) => {
          return this.state.barcode ?
            item.product_barcode && item.product_barcode.toUpperCase().includes(this.state.barcode.toUpperCase())
            || item.product_uid && item.product_uid.toUpperCase().includes(this.state.barcode.toUpperCase())
            || item.product_name && item.product_name.toUpperCase().includes(this.state.barcode.toUpperCase())
            : true
        }).filter(item=>item.verified_pcs != 0).map(data => {
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
                <Row>
                  <Text>
                    {data.product_barcode}
                  </Text>
                </Row>
                <Row>
                  <Text style={{color: temperatureColor(data.product_temperature)}}>
                    {data.product_temperature}
                  </Text>
                </Row>

                {
                  data.existing_shelves ?                 <Row>
                  { 
                    data.existing_shelves.map(shelf=>{
                      return <Badge
                      key={shelf}
                      style={{
                        borderRadius: 3,
                        height: 25,
                        width: 100,
                        backgroundColor: "#c3c3d5"
                      }}
                      textStyle={{ color: "white" }}>
                        <Text>{shelf}</Text>
                      </Badge>
                    })
                  }
                
                </Row> : null
                }

              </Col>
              <Col size={2} style={styles.vertical_center} >
                <Text>
                  {data.received_count + "/" + data.verified_box_count}
                </Text>
              </Col>
              <Col size={2} style={styles.vertical_center} >
                {data.received_count == data.verified_box_count ?
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
  }

  toggleAll() {
    let items = this.state.items
    for (let item of items) {
      item.ready_to_receive = this.state.all_checked ? 0 : item.verified_box_count - item.received_count
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

  close() {
    apiFetch(CLOSE_RECEIPT, {
      id: this.state.receipt_id,
    }, (data) => {
      this.props.navigation.goBack()
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
    let items = this.state.items.map((item) => {
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
              <Icon name="checkmark" onPress={() => {
                Alert.alert(
                  '強制結單',
                  '尚未全部上架，是否強制結案此入倉單?',
                  [
                    { text: '確認', onPress: () => {
                      this.close()
                      } 
                    },
                    {
                      text: '取消',
                    },

                  ],
                  { cancelable: true },
                );
              }} />
            </Button>

            <Button transparent>
              <Icon name="refresh" onPress={() => this.reload()} />
            </Button>
          </Right>
        </Header>
        {this.state.batch_mode ? this.batchModeRender() : this.singleModeRender()}
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

        {
          this.item_count() == 0 ?
            <Button success full style={[styles.mb15, styles.footer]} onPress={() => {
              this.setState({ isNewItemModalVisible: true })
            }}>
              <Text>新增項目</Text>
            </Button> : null
        }
        { this.item_count() == 0 ?
            <Dialog.Container visible={this.state.isNewItemModalVisible}>
              <Dialog.Title>請輸入品號或條碼</Dialog.Title>
              <Dialog.Input value={this.state.new_item_uid}
                placeholder='請輸入品號或條碼'
                autoFocus={true}
                onFocus={() => this.setState({ new_item_uid: null })}
                onChangeText={
                  (text) => {
                    this.setState({ new_item_uid: text })
                  }
                }
                onEndEditing={(event) => {
                  this.setState({ isNewItemModalVisible: false })
                  this.addNewItem()
                }}
                returnKeyType="done" />
              <Dialog.Button label="取消" onPress={() => this.setState({ isNewItemModalVisible: false })} />
            </Dialog.Container> : null
  
        }
        <Footer>
          <FooterTab>
            <Button active={!this.state.batch_mode} onPress={() => this.setBatchMode(false)}>
              <Text>
                逐板
          </Text>
            </Button>
            <Button active={this.state.batch_mode} onPress={() => this.setBatchMode(true)}>
              <Text>
                批次
          </Text>
            </Button>
          </FooterTab>
        </Footer>
      </Container>
    );
  }
}

export default ShowReceipt;
