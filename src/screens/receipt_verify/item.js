
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
  DatePicker
} from "native-base";
import styles from "./styles";

import * as AppActions from '../../redux/actions/AppAction'
import { apiFetch, GET_RECEIPT_ITEM, VERIFY_RECEIPT_ITEM } from "../../api"



class ReceiptVerifyItem extends Component {
  constructor(props) {
    super(props)
    this.reload = this.reload.bind(this)
    this.verify = this.verify.bind(this)
    this.state = { dirty: false, previous_set: false }
  }
  reload() {
    const { item_id, receipt_id } = this.props.navigation.state.params;
    apiFetch(GET_RECEIPT_ITEM, { receipt_id: receipt_id, id: item_id }, (_data) => {
      this.setState(_data)
      if (parseInt(_data.verified_pcs) > 0) {
        this.setState({
          previous_set: true,
          verified_pcs: parseInt(_data.verified_pcs),
        })
      }
    })
  }
  verify() {
    const { item_id, receipt_id } = this.props.navigation.state.params;
    apiFetch(VERIFY_RECEIPT_ITEM, { receipt_id: receipt_id, 
      id: item_id, 
      pcs: this.state.verified_pcs,
      batch: this.state.batch,
      expiration_date: this.state.expiration_date,
      box_height: this.state.box_height,
      box_length: this.state.box_length,
      box_weight: this.state.box_weight,
      box_width: this.state.box_width,
      stack_base: this.state.stack_base,
      stack_level: this.state.stack_level
    }, (_data) => {
      this.props.navigation.state.params.onBack()
      this.props.navigation.goBack()
    })

  }
  componentWillMount() {
    this.reload()
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
            <Title>品項驗收</Title>
          </Body>
          <Right>
            <Button transparent>
              <Icon name="refresh" onPress={() => this.reload()} />
            </Button>
          </Right>
        </Header>

        <Content padder>
          { this.state.id ? 
            <Card style={styles.mb}>
              <CardItem>
                <Left>
                  <Text>品名</Text>
                </Left>
                <Right>
                  <Text>
                    {
                      this.state.product_name
                    }
                  </Text>
                </Right>
              </CardItem>
              <CardItem>
                <Left>
                  <Text>品號</Text>
                </Left>
                <Right>
                  <Text>
                    {
                      this.state.product_uid
                    }
                  </Text>
                </Right>
              </CardItem>
              <CardItem>
                <Left>
                  <Text>條碼</Text>
                </Left>
                <Right>
                  <Text>
                    {
                      this.state.product_barcode
                    }
                  </Text>
                </Right>
              </CardItem>
              <CardItem>
                <Left>
                  <Text>倉別</Text>
                </Left>
                <Right>
                  <Text>
                    {
                      `${this.state.storage_type}   ${this.state.storage_type_name}`
                    }
                  </Text>
                </Right>
              </CardItem>
              {
                this.state.expiration_date ? 
                <CardItem>
                <Left>
                  <Text>效期</Text>
                </Left>
                <Right>
                  <Item success >
                    <DatePicker textAlign={'right'}
                      defaultDate={new Date(this.state.expiration_date) }
                      onDateChange={
                        (date) => {
                          this.setState({ expiration_date: date ,dirty:true})
                        }
                      }
                    />
                  </Item>
                </Right>
              </CardItem> : null
              }

              <CardItem>
                <Left>
                  <Text>批號</Text>
                </Left>
                <Right>
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

                </Right>
              </CardItem>
              <CardItem>
                <Left>
                  <Text>材積</Text>
                </Left>
                <Right>
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
                </Right>
              </CardItem>
              <CardItem>
                <Left>
                  <Text>堆疊</Text>
                </Left>
                <Right>
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
                </Right>
              </CardItem>

              <CardItem>
                <Left>
                  <Text>應收</Text>
                </Left>
                <Right>
                  <Text>
                    {this.state.scheduled_pcs}
                  </Text>
                </Right>
              </CardItem>
              <CardItem>
                <Left>
                  <Text>實收</Text>
                </Left>
                <Right>
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


                </Right>
              </CardItem>

            </Card> : null
          }
          <View style={styles.footer}>
            {this.state.dirty && this.state.verified_pcs ?
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
      </Container>
    );
  }
}
export default ReceiptVerifyItem