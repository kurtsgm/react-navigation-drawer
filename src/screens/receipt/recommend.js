import React, { Component } from "react";
import { View, Picker } from 'react-native';
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
  Input
} from "native-base";

import Dialog from "react-native-dialog";

import { Grid, Col } from "react-native-easy-grid";
import { apiFetch, RECEIVE_RECEIPT } from "../../api"
import styles from "./styles";
import { normalize_shelf_barcode } from '../../sdj_common'


class RecommendShelf extends Component {
  constructor(props) {
    super(props)
    const { params } = this.props.navigation.state;
    this.state = {
      shelf_token: params.shelf.token,
      show_picker: false,
      isModalVisible: false,
      confirm_shelf: null,
      receipt_id: params.receipt_id
    }
    this.onShelfSelected = this.onShelfSelected.bind(this)
    this._toggleModal = this._toggleModal.bind(this)
  }
  onShelfSelected(token) {
    this.setState({ shelf_token: token, show_picker: false })
  }
  _toggleModal() {
    this.setState({ isModalVisible: !this.state.isModalVisible });
  }

  receive() {
    items = this.props.navigation.state.params.items.map((item) => {
      if (item.ready_to_receive > 0) {
        return { id: item.id, quantity: item.ready_to_receive }
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
                    let shelf_token = event.nativeEvent.text.trim()
                    this.setState({ shelf_token: shelf_token })
                  }
                } />
            </ListItem>

            {this.props.navigation.state.params.items.map(data => {
              return <ListItem key={data.id}>
                <Left>
                  <Left>
                    <Text>
                      {data.product_name + " " + data.storage_type_name}
                    </Text>
                  </Left>
                </Left>
                <Text>
                  {data.ready_to_receive}
                </Text>
              </ListItem>
            })
            }
          </List>
          <Dialog.Container visible={this.state.isModalVisible}>
            <Dialog.Title>請掃描儲位</Dialog.Title>
            <Dialog.Input keyboardType='numeric' value={this.state.confirm_shelf}
              placeholder='請掃描儲位'
              autoFocus={true}
              ref={(input) => { this.confirm_input = input; }}
              onChangeText={
                (text) => {
                  this.setState({ confirm_shelf: normalize_shelf_barcode(text) })
                }
              }
              onEndEditing={(event) => {
                this.setState({ isModalVisible: false })
                if (event.nativeEvent.text == this.state.shelf_token) {
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
