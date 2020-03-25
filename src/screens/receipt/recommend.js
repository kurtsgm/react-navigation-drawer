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
  List,
  ListItem,
  Toast,
  Input,
  Item
} from "native-base";

import Dialog from "react-native-dialog";

import { Grid, Col } from "react-native-easy-grid";
import { apiFetch, RECEIVE_RECEIPT } from "../../api"
import styles from "./styles";
import { normalize_shelf_barcode } from '../../common'


class RecommendShelf extends Component {
  constructor(props) {
    super(props)
    const { params } = this.props.navigation.state;
    this.state = {
      shelf_token: params.shelf.token,
      show_picker: false,
      isModalVisible: false,
      confirm_shelf: null,
      receipt_id: params.receipt_id,
      items: params.items.map(item => {
        item.total_quantity = Math.min(item.ready_to_receive * item.pcs_per_box,item.verified_pcs-item.received_pcs)
        return item
      })
    }
    this.onShelfSelected = this.onShelfSelected.bind(this)
    this._toggleModal = this._toggleModal.bind(this)
    this.checkItemValid = this.checkItemValid.bind(this)
  }
  onShelfSelected(token) {
    this.setState({ shelf_token: token, show_picker: false })
  }
  _toggleModal() {
    this.setState({ isModalVisible: !this.state.isModalVisible });
  }

  receive() {
    items = this.state.items.map((item) => {
      if (item.ready_to_receive > 0) {
        return { id: item.id, quantity: item.ready_to_receive, total_quantity: item.total_quantity }
      }
    }).filter(Boolean);
    apiFetch(RECEIVE_RECEIPT, {
      id: this.state.receipt_id,
      shelf_token: this.state.shelf_token,
      items: items
    }, (data) => {
      if (data.status == "success") {
        this.props.navigation.state.params.onReceived()
        this.props.navigation.goBack()
      } else {
        Toast.show({
          text: data.message,
          duration: 2500,
          type: 'danger',
          position: "top",
          textStyle: { textAlign: "center" }
        })
      }
    });
  }
  checkItemValid(item){
    let _original_quantity = item.ready_to_receive * item.pcs_per_box 
    return _original_quantity- item.total_quantity < item.pcs_per_box && _original_quantity >= item.total_quantity
  }
  render() {
    const { back } = this.props.navigation;
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
          </Right>
        </Header>

        <Content>
          <List>
            <ListItem key="shelf">
              <Left>
                <Text>
                  儲位
              </Text>
              </Left>
              <Input placeholder='請指定儲位'
                keyboardType='numeric'
                returnKeyType="done"
                value={this.state.shelf_token}
                onChangeText={(text) => this.setState({ shelf_token: normalize_shelf_barcode(text.toUpperCase()) })}
                onFocus={() => { this.setState({ shelf_token: '' }) }}
                onEndEditing={
                  (event) => {
                    let shelf_token = normalize_shelf_barcode(event.nativeEvent.text.trim())
                    this.setState({ shelf_token: shelf_token })
                  }
                } />
            </ListItem>

            {this.state.items.map(data => {
              return <ListItem key={data.id}>
                <Left>
                  <Text>
                    {data.product_name + " " + data.storage_type_name}
                  </Text>
                </Left>
                <Body>
                <Text>
                  {data.ready_to_receive}
                  箱
                </Text>
                </Body>
                <Right>
                  <Item success >
                    <Input keyboardType='numeric'
                      style={this.checkItemValid(data) ? {} : styles.text_red}
                      value={`${data.total_quantity}`}
                      onEndEditing={
                        (event)=>{
                          let items = this.state.items
                          for (let item of items) {
                            if(!this.checkItemValid(item)){
                              Toast.show({
                                text: "數值錯誤，數量差異過大",
                                duration: 2500,
                                type: 'danger',
                                position: "top",
                                textStyle: { textAlign: "center" }
                              })
                            }
                          }
                        }
                      }
                      onChangeText={
                        (text) => {
                          let items = this.state.items
                          for (let item of items) {
                            if (item.id == data.id) {
                              item.total_quantity = text
                              break
                            }  
                          }
                          this.setState({ items: items })
                        }
                      }
                      returnKeyType="done" />
                  </Item>
                </Right>

              </ListItem>
            })
            }
          </List>
          <Dialog.Container visible={this.state.isModalVisible}>
            <Dialog.Title>請掃描儲位</Dialog.Title>
            <Dialog.Input keyboardType='numeric' value={this.state.confirm_shelf}
              placeholder='請掃描儲位'
              autoFocus={true}
              onFocus={()=>this.setState({confirm_shelf:null})}
              ref={(input) => { this.confirm_input = input; }}
              onChangeText={
                (text) => {
                  this.setState({ confirm_shelf: normalize_shelf_barcode(text) })
                }
              }
              onEndEditing={(event) => {
                this.setState({ isModalVisible: false })
                if (normalize_shelf_barcode(event.nativeEvent.text) == this.state.shelf_token) {
                  this.receive()
                } else {
                  Toast.show({
                    text: '錯誤，掃描結果不符',
                    duration: 2500,
                    type: 'danger',
                    position: "top",
                    textStyle: { textAlign: "center" }
                  })
                }
              }}
              returnKeyType="done" />
            <Dialog.Button label="取消" onPress={() => this.setState({ isModalVisible: false })} />
          </Dialog.Container>

        </Content>
        {
          this.state.shelf_token ?
            <View style={styles.footer}>
              <Button primary full style={[styles.mb15, styles.footer]} onPress={() => {
                this.setState({ isModalVisible: true })
              }}>
                <Text>確認入倉</Text>
              </Button>
            </View>
            : null

        }
      </Container>
    );
  }
}

export default RecommendShelf;
