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
  Item,
  Input,
  Toast
} from "native-base";
import styles from "./styles";
import Dialog from "react-native-dialog";
import * as AppActions from '../../redux/actions/AppAction'
import { apiFetch, GET_RECEIPT, GET_PRODUCTS ,VERIFY_RECEIPT_ALL_ITEM} from "../../api"
import { store } from '../../redux/stores/store'
import { Grid, Col, Row } from "react-native-easy-grid";

class ShowVerifyReceipt extends Component {
  constructor(props) {
    super(props)
    this.state = {
      items: [],
      barcode: null,
      isModalVisible: false,
      new_item_uid: null,
    }
    this.reload = this.reload.bind(this)
    this.onBack = this.onBack.bind(this)
    this.addNewItem = this.addNewItem.bind(this)
    this.verifyAll = this.verifyAll.bind(this)
    this.reload()

  }
  reload() {
    const { receipt } = this.props.navigation.state.params;
    apiFetch(GET_RECEIPT, { id: receipt.id }, (_data) => {
      this.setState({ items: _data.items })
    })
  }

  addNewItem() {
    const { receipt } = this.props.navigation.state.params;
    apiFetch(GET_PRODUCTS, { barcode: this.state.new_item_uid, shop_id: receipt.shop_id }, (_data) => {
      if (_data.length > 0) {
        product = _data[0]
        this.props.navigation.navigate("ReceiptVerifyItem", { receipt_id: receipt.id, new_item: product, onBack: this.onBack })
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
  verifyAll(){
    const { receipt } = this.props.navigation.state.params;

    apiFetch(VERIFY_RECEIPT_ALL_ITEM, { receipt_id: receipt.id }, (_data) => {
      this.reload()
    })
  }
  onBack() {
    this.reload()
  }
  render() {
    let rows = []
    const { receipt } = this.props.navigation.state.params;
    this.state.items.filter(item => {
      if (this.state.barcode) {
        return item.product_uid.toUpperCase().includes(this.state.barcode)
          || (item.product_barcode && item.product_barcode.toUpperCase().includes(this.state.barcode.toUpperCase()))
          || item.product_name && item.product_name.toUpperCase().includes(this.state.barcode.toUpperCase())
      }
      return true
    }).forEach((item) => {
      rows.push(
        <ListItem key={item.id} button onPress={() => {
          this.props.navigation.navigate("ReceiptVerifyItem", { receipt_id: receipt.id, item_id: item.id, onBack: this.onBack })
        }
        }>
          <Left>
            {item.verified_pcs || item.verified_pcs == 0 ?
              <Icon name="checkmark-circle" style={{ color: "#3ADF00" }} /> : null}
            {item.verified_pcs || item.verified_pcs == 0 ?
              <Text>
                {`${[item.product_name, item.storage_type_name].filter(e => e).join(" ")} [${item.pcs_per_box}入]`}
                {item.expiration_date ? item.expiration_date : ''}
                {`\n應收:${item.scheduled_pcs} 實收:${item.verified_pcs} `}
              </Text>
              :
              <Text>
                {`${[item.product_name, item.storage_type_name].filter(e => e).join(" ")} [${item.pcs_per_box}入]`}
                {item.expiration_date ? item.expiration_date : ''}
                {`\n應收:${item.scheduled_pcs}`}
              </Text>
            }

          </Left>
          <Right>
            <Icon name="arrow-forward" style={{ color: "#999" }} />
          </Right>
        </ListItem>)

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
            <Title>入倉驗收</Title>
          </Body>
          <Right>
            <Button transparent>
              <Icon name="refresh" onPress={() => this.reload()} />
            </Button>
          </Right>
        </Header>
        <Content>
          {
            this.state.items.length > 0 ?
              <List>
                {
                  ["manager"].includes(store.getState().role) ?
                    <ListItem>
                      <Grid>
                        <Col size={4} style={styles.vertical_center} >
                        </Col>
                        <Col size={2} style={styles.vertical_center} >
                          <Button onPress={() => { this.verifyAll() }}>
                            <Text>自動全部驗收</Text>
                          </Button>
                        </Col>
                      </Grid>
                    </ListItem> : null
                }

                <ListItem>
                  <Input placeholder="Search" placeholder="請輸入或者掃描條碼" autoFocus={true}
                    value={this.state.barcode}
                    onFocus={() => this.setState({ barcode: null })}
                    onChangeText={(text) => this.setState({ barcode: text.toUpperCase() })}
                    onEndEditing={
                      (event) => {
                        let barcode = event.nativeEvent.text.trim()
                      }
                    } />
                  <Right>
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
                  </Right>
                </ListItem>


                {rows}
              </List> : null
          }
          <Button primary full style={[styles.mb15, styles.footer]} onPress={() => {
            this.setState({ isModalVisible: true })
          }}>
            <Text>新增項目</Text>
          </Button>
          <Dialog.Container visible={this.state.isModalVisible}>
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
                this.setState({ isModalVisible: false })
                this.addNewItem()
              }}
              returnKeyType="done" />
            <Dialog.Button label="取消" onPress={() => this.setState({ isModalVisible: false })} />
          </Dialog.Container>
        </Content>
      </Container>
    );
  }
}

export default ShowVerifyReceipt;