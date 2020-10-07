
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
  CheckBox,
  Toast,
  Input
} from "native-base";
import { View } from 'react-native';
import { Grid, Row, Col } from "react-native-easy-grid";

import styles from "./styles";

import * as AppActions from '../../redux/actions/AppAction'
import { apiFetch, GET_SHOPS, SET_SHOPS } from "../../api"



class SettingShops extends Component {
  constructor(props) {
    super(props)
    this.state = {
      shops: [],
      dirty: false,
      keyword: null,
    }
    this.reload = this.reload.bind(this)
    this.onBack = this.onBack.bind(this)
    this.onSave = this.onSave.bind(this)
    this.reload()
  }

  reload() {
    apiFetch(GET_SHOPS, {}, (_data) => {
      this.setState({ shops: _data.shops,dirty: false })
    })
  }

  onBack() {
    this.reload()
  }
  onCheck(shop_id) {
    let shops = this.state.shops
    for (let shop of shops) {
      if (shop_id == shop.id) {
        shop.enabled = !shop.enabled 
        break
      }
    }
    this.setState({ shops: shops ,dirty:true})
  }
  onSave() {
    apiFetch(SET_SHOPS, {
      shop_ids: this.state.shops.filter(shop=>shop.enabled).map(shop=>shop.id)
    }, (_data) => {
      Toast.show({
        text: "成功更新",
        duration: 2500,
        textStyle: { textAlign: "center" }
      })
      this.reload()

    })
  }


  render() {
    return (
      <Container style={styles.container}>
        <Header>
          <Left>
            <Button
              transparent
              onPress={() => this.props.navigation.openDrawer()}
            >
              <Icon name="menu" />
            </Button>
          </Left>
          <Body>
            <Title>關聯客戶</Title>
          </Body>
          <Right>
            <Button transparent>
              <Icon name="refresh" onPress={() => this.reload()} />
            </Button>
          </Right>
        </Header>

        <Content>
          <List>
          <ListItem>
          <Input placeholder="請輸入關鍵字" autoFocus={false}
            value={this.state.keyword}
            returnKeyType="done"
            onChangeText={(text) => this.setState({ keyword: text })}
            onEndEditing={
              (event) => {
                let keyword = event.nativeEvent.text.trim()
                this.setState({ keyword: keyword })
              }
            } />
            </ListItem>
            {
              this.state.shops.filter(shop=>{
                return !this.state.keyword || shop.title.includes(this.state.keyword)
              }).map((shop) => {
                return <ListItem key={shop.id}>
                  <Grid>
                    <Col size={1}>
                      <CheckBox checked={shop.enabled}
                        onPress={() => {
                          this.onCheck(shop.id)
                        }} />
                    </Col>
                    <Col size={4}>
                      <Text>{shop.title}</Text>
                    </Col>
                  </Grid>
                </ListItem>

              }
              )

            }
          </List>

        </Content>
        <View style={styles.footer}>
          {this.state.dirty ?             <Button primary full style={[styles.mb15, styles.footer]} onPress={() => {
              this.onSave()
            }}>
            <Text>儲存</Text>
            </Button> 
: null}
        </View>

      </Container>
    );
  }
}

export default SettingShops;