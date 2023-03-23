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
  Toast,
  Picker,
  Badge
} from "native-base";
import styles from "./styles";
import Dialog from "react-native-dialog";
import * as AppActions from '../../redux/actions/AppAction'
import { apiFetch, GET_RECEIPTS, GET_PRODUCTS, VERIFY_RECEIPT_ALL_ITEM } from "../../api"
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
      new_item_receipt: this.props.navigation.state.params.receipts[0],
      new_item_candidate: []
    }
    this.reload = this.reload.bind(this)
    this.onBack = this.onBack.bind(this)
    this.addNewItem = this.addNewItem.bind(this)
    this.verifyAll = this.verifyAll.bind(this)
    this.setCandidate = this.setCandidate.bind(this)

    this.reload()

  }
  reload() {
    const { receipts } = this.props.navigation.state.params;
    apiFetch(GET_RECEIPTS, { ids: receipts.map(receipt => receipt.id), to_be_verified: true, with_items: true }, (_data) => {
      this.setState({ items: _data.flatMap(receipt => receipt.items) })
    })
  }

  setCandidate(_data){
    this.setState({new_item_candidate: _data})
  }


  addNewItem() {
    apiFetch(GET_PRODUCTS, { barcode: this.state.new_item_uid, shop_id: this.state.new_item_receipt.shop_id }, (_data) => {
      console.log(_data)
      if (_data.length == 1) {
        let product = _data[0]
        this.setState({ isModalVisible: false })
        this.props.navigation.navigate("ReceiptVerifyItem", { receipt_id: this.state.new_item_receipt.id, new_item: product, onBack: this.onBack })
      }
      else if(_data.length > 1){
        this.setCandidate(_data)
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
  verifyAll() {
    const { receipts } = this.props.navigation.state.params;
    for (receipt of receipts) {
      apiFetch(VERIFY_RECEIPT_ALL_ITEM, { receipt_id: receipt.id }, (_data) => {
        this.reload()
      })
    }
  }
  onBack() {
    this.reload()
  }
  render() {
    let rows = []
    const { receipts } = this.props.navigation.state.params;
    let {new_item_receipt}  = this.state
    this.state.items.filter(item => {
      if (this.state.barcode) {
        return item.product_uid.toUpperCase().includes(this.state.barcode)
          || (item.product_barcode && item.product_barcode.toUpperCase().includes(this.state.barcode.toUpperCase()))
          || item.product_name && item.product_name.toUpperCase().includes(this.state.barcode.toUpperCase())
      }
      return true
    }).sort((a,b)=> `${a.uid}-${a.expiration_date}-${a.batch}-${a.receipt_id}`.localeCompare(`${b.uid}-${b.expiration_date}-${b.batch}`)).forEach((item) => {
      rows.push(
        <ListItem key={item.id} button onPress={() => {
          this.props.navigation.navigate("ReceiptVerifyItem", { receipt_id: item.receipt_id, item_id: item.id, onBack: this.onBack })
        }
        }>
          <Left>
            <Grid>
              <Row>
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
              </Row>
              {
                receipts.length > 1 ?
                  <Row>
                    <Badge
                      style={{
                        borderRadius: 3,
                        height: 25,
                        width: 100,
                        backgroundColor: "#c3c3d5"
                      }}
                      textStyle={{ color: "white" }}
                    >
                      <Text>{receipts.filter(r => r.id == item.receipt_id)[0].title}</Text>
                    </Badge></Row> : null
              }


            </Grid>
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
                <ListItem>
                  <Grid>
                    <Col size={4} style={styles.vertical_center} >
                    </Col>
                    <Col size={2} style={styles.vertical_center} >
                      <Button onPress={() => { this.verifyAll() }}>
                        <Text>一鍵驗收</Text>
                      </Button>
                    </Col>
                  </Grid>
                </ListItem> 
                <ListItem>
                  <Input placeholder="請輸入或者掃描條碼" 
                    value={this.state.barcode}
                    onFocus={() => this.setState({ barcode: null })}
                    returnKeyType="done"
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
            this.setState({ isModalVisible: true ,new_item_candidate:[]})
          }}>
            <Text>新增項目</Text>
          </Button>
          <Dialog.Container visible={this.state.isModalVisible}>
            {
              receipts.length > 1 ?<Dialog.Description><Picker mode="dropdown"
                headerBackButtonText="返回"
                style={{ width: 200 }}
                textStyle={{ color: "red" }}
                iosHeader="選擇入倉單"
                placeholder="選擇入倉單"
                iosIcon={<Icon name="arrow-down" />}
                onValueChange={(id) => { this.setState({ new_item_receipt: receipts.find(r => r.id == id) }) }}
                selectedValue={new_item_receipt.id}
              >
                {
                  receipts.map(_receipt => {
                    return <Picker.Item key={_receipt.id} label={`${_receipt.title} `} value={_receipt.id}></Picker.Item>
                  })
                }
              </Picker></Dialog.Description>  : null
            }
            <Dialog.Title>請輸入品號或條碼</Dialog.Title>
            <Dialog.Input value={this.state.new_item_uid}
              placeholder='請輸入品號或條碼'
              autoFocus={true}
              style={{ color: 'black' }} //bug fix for android dark mode
              onFocus={() => this.setState({ new_item_uid: null })}
              onChangeText={
                (text) => {
                  this.setState({ new_item_uid: text })
                }
              }
              onEndEditing={(event) => {
                this.setCandidate([])
                this.addNewItem()
              }}

              returnKeyType="done" />
              {
                this.state.new_item_candidate.map(candidate=>{
                  return <Button bordered light block primary style={styles.dialog_inside_button} onPress={() => {
                    this.props.navigation.navigate("ReceiptVerifyItem", { receipt_id: this.state.new_item_receipt.id, new_item: candidate, onBack: ()=>this.reload() })
                    this.setState({ isModalVisible: false })
            
                  }}>
                      <Text>{`${candidate.uid}`}</Text> 
                  </Button>
                })
              }

            <Dialog.Button label="取消" onPress={() => this.setState({ isModalVisible: false })} />
          </Dialog.Container>
        </Content>
      </Container>
    );
  }
}

export default ShowVerifyReceipt;