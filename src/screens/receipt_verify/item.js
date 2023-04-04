
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
  Card,
  CardItem,
  Input,
  Item,
  Label,
  Picker
} from "native-base";
import styles from "./styles";

import * as AppActions from '../../redux/actions/AppAction'
import { apiFetch, GET_RECEIPT_ITEM, GET_SHOP_PRODUCT_STORAGE_TYPES, VERIFY_RECEIPT_ITEM } from "../../api"
import { normalize_date } from '../../common'
import { Grid, Col, Row } from "react-native-easy-grid";

class ReceiptVerifyItem extends Component {
  constructor(props) {
    super(props)
    this.reload = this.reload.bind(this)
    this.verify = this.verify.bind(this)
    this.valid = this.valid.bind(this)
    this.state = { dirty: false, previous_set: false, product_storage_types: [] ,serial_numbers: []}
  }
  componentDidMount() {
    this.reload()
  }
  reload() {
    const { item_id, receipt_id, new_item } = this.props.navigation.state.params;
    if (item_id) {
      apiFetch(GET_RECEIPT_ITEM, { receipt_id: receipt_id, id: item_id }, (_data) => {
        console.log(_data)
        this.setState(_data)
        if (_data.verified_pcs) {
          this.setState({
            previous_set: true,
            verified_pcs: parseInt(_data.verified_pcs),
          })
        }
      })
    } else if (new_item) {
      apiFetch(GET_SHOP_PRODUCT_STORAGE_TYPES, { shop_id: new_item.shop_id }, (_data) => {
        this.setState({
          product_storage_types: _data.product_storage_types
        })
      })
      this.setState({
        product_barcode: new_item.barcode,
        product_name: new_item.name,
        product_uid: new_item.uid,
        product_id: new_item.id,
        product_default_pcs: new_item.default_pcs,
        preset_product_default_pcs: new_item.default_pcs,
        box_height: new_item.box_height,
        box_length: new_item.box_length,
        box_weight: new_item.box_weight,
        box_width: new_item.box_width,
        stack_base: new_item.stack_base,
        stack_level: new_item.stack_level,
      })
    }
  }

  valid() {
    const { item_id } = this.props.navigation.state.params;
    return this.state.dirty && this.state.verified_pcs && (item_id || (this.state.product_storage_type_id))
  }
  verify() {
    const { item_id, receipt_id } = this.props.navigation.state.params;
    apiFetch(VERIFY_RECEIPT_ITEM, {
      receipt_id: receipt_id,
      id: item_id ? item_id : 'new',
      pcs: this.state.verified_pcs,
      batch: this.state.batch,
      expiration_date: this.state.expiration_date,
      box_height: this.state.box_height,
      box_length: this.state.box_length,
      box_weight: this.state.box_weight,
      box_width: this.state.box_width,
      stack_base: this.state.stack_base,
      stack_level: this.state.stack_level,
      product_uid: this.state.product_uid,
      product_id: this.state.product_id,
      product_barcode: this.state.product_barcode,
      product_default_pcs: this.state.product_default_pcs,
      product_storage_type_id: this.state.product_storage_type_id,
      serial_numbers: this.state.serial_numbers
    }, (_data) => {
      this.props.navigation.state.params.onBack()
      this.props.navigation.goBack()
    })

  }
  render() {
    const { item_id, new_item } = this.props.navigation.state.params;
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
            <Title>品項驗收</Title>
          </Body>
          <Right>
            {
              item_id ?
                <Button transparent>
                  <Icon name="refresh" onPress={() => this.reload()} />
                </Button> : null
            }
          </Right>
        </Header>

        <Content padder>
          {this.state.id || new_item ?
            <Card style={styles.mb}>
              <CardItem>
                <Row>
                  <Col size={1}>
                    <Text>品名</Text>
                  </Col>
                  <Col size={2}>
                    <Text>
                      {
                        this.state.product_name
                      }
                    </Text>
                  </Col>
                </Row>
              </CardItem>
              <CardItem>
                <Row>
                  <Col size={1}>
                    <Text>品號</Text>
                  </Col>
                  <Col size={2}>
                    <Text>
                      {
                        this.state.product_uid
                      }
                    </Text>
                  </Col>
                </Row>
              </CardItem>
              <CardItem>
                <Row>
                  <Col size={1}>
                    <Text>倉別</Text>
                  </Col>
                  <Col size={2}>
                    {
                      this.state.storage_type && this.state.storage_type_name ?
                        <Text>
                          {
                            `${this.state.storage_type}   ${this.state.storage_type_name}`
                          }
                        </Text> : <Picker mode="dropdown"
                          headerBackButtonText="返回"
                          style={{ width: 200 }}
                          textStyle={this.state.product_storage_type_id ? {} : { color: "red" }}
                          iosHeader="選擇倉別"
                          placeholder="選擇倉別"
                          iosIcon={<Icon name="arrow-down" />}
                          onValueChange={(id) => { this.setState({ product_storage_type_id: id }) }}
                          selectedValue={this.state.product_storage_type_id}
                        >
                          {
                            this.state.product_storage_types.length > 0 ? this.state.product_storage_types.map(product_storage_type => {
                              return <Picker.Item key={product_storage_type.id} label={`${product_storage_type.name} ${product_storage_type.code}`} value={product_storage_type.id}></Picker.Item>
                            }) : null
                          }
                        </Picker>

                    }
                  </Col></Row>
              </CardItem>
              {
                this.state.scheduled_pcs ?
                  <CardItem>
                    <Row><Col size={1}>
                      <Text>應收PCS</Text>
                    </Col>
                      <Col size={2}>
                        <Text>
                          {this.state.scheduled_pcs}
                        </Text>
                        {
                          parseInt(this.state.product_default_pcs) > 0 ?
                            <Text>
                              {`(${Math.ceil(this.state.scheduled_pcs / parseInt(this.state.product_default_pcs))} 箱)`}
                            </Text> : null
                        }
                      </Col></Row>
                  </CardItem> : null
              }

              <CardItem>
                <Row>
                  <Col size={1}>
                    <Text>實收PCS</Text>
                  </Col>
                  <Col size={2}>
                    <Item success >
                      <Input keyboardType='numeric' textAlign={'right'}
                        value={`${this.state.verified_pcs ? this.state.verified_pcs : ''}`}
                        onChangeText={
                          (text) => {
                            this.setState({ verified_pcs: text })
                          }
                        }
                        onEndEditing={(event) => { this.setState({ dirty: true }) }}
                        returnKeyType="done" />

                    </Item>
                  </Col>
                </Row>
              </CardItem>
              <CardItem>
                <Row><Col size={1}>
                  <Text>標準箱入數</Text>
                </Col>
                  <Col size={2}>
                    {
                      this.state.preset_product_default_pcs ? <Text>{this.state.preset_product_default_pcs}</Text> :
                        <Item success >
                          <Input keyboardType='numeric' textAlign={'right'}
                            value={`${this.state.product_default_pcs ? this.state.product_default_pcs : ''}`}
                            onChangeText={
                              (text) => {
                                this.setState({ product_default_pcs: text })
                              }
                            }
                            onEndEditing={(event) => { this.setState({ dirty: true }) }}
                            returnKeyType="done" />

                        </Item>
                    }


                  </Col></Row>
              </CardItem>
              <CardItem>
                <Row><Col size={1}>
                  <Text>條碼</Text>
                </Col>
                  <Col size={2}>
                    <Item success >
                      <Input textAlign={'right'}
                        value={`${this.state.product_barcode ? this.state.product_barcode : ''}`}
                        onChangeText={
                          (text) => {
                            this.setState({ product_barcode: text })
                          }
                        }
                        onEndEditing={(event) => { this.setState({ dirty: true }) }}
                        returnKeyType="done" />
                      <Button
                        transparent
                        onPress={() =>
                          this.props.navigation.navigate("BarcodeScanner", {
                            onBarcodeScanned: (barcode) => {
                              this.setState({ product_barcode: barcode })
                            }
                          }
                          )
                        }
                      >
                        <Icon name="camera" />
                      </Button>
                    </Item>
                  </Col></Row>
              </CardItem>
              <CardItem>
                <Row><Col size={1}>
                  <Text>效期</Text>
                </Col>
                  <Col size={2}>
                    <Item success >
                      <Input textAlign={'right'} keyboardType='numeric'
                        value={`${this.state.expiration_date ? this.state.expiration_date : ''}`}
                        onChangeText={
                          (text) => {
                            this.setState({ expiration_date: normalize_date(text) })
                          }
                        }
                        onEndEditing={(event) => {
                          if (this.state.expiration_date && this.state.expiration_date.length < 10) {
                            this.setState({ expiration_date: null })
                          } else {
                            this.setState({ dirty: true })
                          }
                        }}
                        returnKeyType="done" />
                    </Item>
                  </Col></Row>
              </CardItem>
              <CardItem>
                <Row><Col size={1}>
                  <Text>批號</Text>
                </Col>
                  <Col size={2}>
                    <Item success >
                      <Input textAlign={'right'}
                        value={`${this.state.batch ? this.state.batch : ''}`}
                        onChangeText={
                          (text) => {
                            this.setState({ batch: text })
                          }
                        }
                        onEndEditing={(event) => { this.setState({ dirty: true }) }}
                        returnKeyType="done" />
                    </Item>
                  </Col></Row>
              </CardItem>
              <CardItem>
                <Row>
                  <Col size={1}>
                    <Text>驗收序號</Text>
                  </Col>
                  <Col size={2}>
                    <Item success >
                      {
                        this.state.serial_numbers.length > 0  ?
                          <Text>{`已驗${this.state.serial_numbers.length}筆`}</Text> :
                          null
                      }
                      <Button
                        transparent
                        onPress={() =>
                          this.props.navigation.navigate("BatchBarcodeScanner", {
                            scannedBarcodes: this.state.serial_numbers,
                            onBarcodeScanned: (serial_numbers) => {
                              this.setState({ serial_numbers: serial_numbers })
                            }
                          }
                          )
                        }
                      >
                        <Icon name="camera" />
                      </Button>

                    </Item>
                  </Col>
                </Row>
              </CardItem>
              <CardItem>
                <Row><Col size={1}>
                  <Text>材積</Text>
                </Col>
                  <Col size={2}>
                    <Item inlineLabel>
                      <Label>長：</Label>
                      <Input keyboardType='numeric' textAlign={'right'}
                        value={`${this.state.box_length ? this.state.box_length : ''}`}
                        onChangeText={
                          (text) => {
                            this.setState({ box_length: text })
                          }
                        }
                        onEndEditing={(event) => { this.setState({ dirty: true }) }}
                        returnKeyType="done" />
                    </Item>
                    <Item inlineLabel>
                      <Label>寬：</Label>
                      <Input keyboardType='numeric' textAlign={'right'}
                        value={`${this.state.box_width ? this.state.box_width : ''}`}
                        onChangeText={
                          (text) => {
                            this.setState({ box_width: text })
                          }
                        }
                        onEndEditing={(event) => { this.setState({ dirty: true }) }}
                        returnKeyType="done" />
                    </Item>
                    <Item inlineLabel>
                      <Label>高：</Label>
                      <Input keyboardType='numeric' textAlign={'right'}
                        value={`${this.state.box_height ? this.state.box_height : ''}`}
                        onChangeText={
                          (text) => {
                            this.setState({ box_height: text })
                          }
                        }
                        onEndEditing={(event) => { this.setState({ dirty: true }) }}
                        returnKeyType="done" />
                    </Item>
                    <Item inlineLabel>
                      <Label>重：</Label>
                      <Input keyboardType='numeric' textAlign={'right'}
                        value={`${this.state.box_weight ? this.state.box_weight : ''}`}
                        onChangeText={
                          (text) => {
                            this.setState({ box_weight: text })
                          }
                        }
                        onEndEditing={(event) => { this.setState({ dirty: true }) }}
                        returnKeyType="done" />
                    </Item>
                  </Col></Row>
              </CardItem>
              <CardItem>
                <Row><Col size={1}>
                  <Text>堆疊</Text>
                </Col>
                  <Col size={2}>
                    <Item inlineLabel>
                      <Label>底：</Label>
                      <Input keyboardType='numeric' textAlign={'right'}
                        value={`${this.state.stack_base ? this.state.stack_base : ''}`}
                        onChangeText={
                          (text) => {
                            this.setState({ stack_base: text })
                          }
                        }
                        onEndEditing={(event) => { this.setState({ dirty: true }) }}
                        returnKeyType="done" />
                    </Item>
                    <Item inlineLabel>
                      <Label>高：</Label>
                      <Input keyboardType='numeric' textAlign={'right'}
                        value={`${this.state.stack_level ? this.state.stack_level : ''}`}
                        onChangeText={
                          (text) => {
                            this.setState({ stack_level: text })
                          }
                        }
                        onEndEditing={(event) => { this.setState({ dirty: true }) }}
                        returnKeyType="done" />
                    </Item>
                  </Col></Row>
              </CardItem>
            </Card> : null
          }
          <View style={styles.footer}>
            {this.valid() ?
              <Button primary full style={[styles.mb15, styles.footer]} onPress={() => {
                if (this.state.previous_set) {
                  Alert.alert(
                    '重複驗收',
                    '已有驗收紀錄，是否覆蓋/更新先前的數量?',
                    [
                      {
                        text: '取消',
                        style: 'cancel',
                      },
                      { text: '確認', onPress: () => this.verify() }
                    ],
                    { cancelable: true },
                  );
                } else {
                  this.verify()
                }
              }}>
                <Text>確認驗收</Text>
              </Button> : null
            }
          </View>

        </Content>
      </Container >
    );
  }
}
export default ReceiptVerifyItem