
import React, { Component } from "react";
import { View ,Alert} from 'react-native';
import {
  Container,
  Header,
  Title,
  Content,
  Button,
  Icon,
  Body,
  Left,
  Right,
  Input,
  Item,
  Form,
  List,
  ListItem,
  Text,
  Toast,
  Label,
  Card,
  CardItem,
  CheckBox
} from "native-base";

import styles from "./styles"
import { apiFetch, GET_SHELVES, GET_SHELF_INFO ,MERGE_SHELVES} from "../../api"
import { ActionSheetCustom as ActionSheet } from 'react-native-actionsheet'

const init_state =  {
  shelves: [],
  source_shelf: null,
  destination_shelf: null,
  destination_shelves_candidate: [],
  products: []
}

class ShelfMerge extends Component {
  constructor() {
    super()
    this.state = init_state
    this.reload = this.reload.bind(this)
    this.onSourceSelected = this.onSourceSelected.bind(this)
    this.toggle_product = this.toggle_product.bind(this)
    this.valid = this.valid.bind(this)
  }

  componentWillMount() {
    this.reload()
  }
  reload() {
    apiFetch(GET_SHELVES,{},data => {
      this.setState(Object.assign(init_state,{ shelves: data }))
    })
  }

  valid(){
    return this.state.source_shelf && this.state.destination_shelf && this.state.products.filter(p=>p.checked).length > 0
  }

  onSourceSelected(token) {
    apiFetch(GET_SHELF_INFO, { token: token },data => {
      let avaible_shelves = this.state.shelves.filter((shelf) => shelf.shop_id == null || shelf.shop_id == data.shop_id)
      this.setState({
        source_shelf: token,
        destination_shelves_candidate: avaible_shelves,
        products: data.storages.map(shelf_storage => {
          return {
            checked: true,
            id: shelf_storage.id,
            pcs: shelf_storage.pcs,
            product_title: shelf_storage.product_storage.product.name,
            expiration_date: shelf_storage.product_storage.expiration_date
          }
        })
      })
    })

  }

  toggle_product(id) {
    let products = this.state.products
    for (let p of products) {
      if (p.id == id) {
        p.checked = !p.checked
      }
    }
    this.setState({ products: products })

  }

  merge(){
    apiFetch(MERGE_SHELVES,{
      from: this.state.source_shelf,
      to: this.state.destination_shelf,
      shelf_storages: this.state.products.filter(p=>p.checked).map(p=>p.id)
    },data => {
      if(data.status == "success"){
        this.reload()
        Alert.alert("系統訊息", "已成功轉移")
      }else{
        Alert.alert("系統訊息", `錯誤，${data.message}`)
      }
    })
  }

  render() {
    let rows = []
    return (
      <Container style={styles.container}>
        <Header searchBar rounded>
          <Left>
            <Button transparent onPress={() => { this.props.navigation.navigate("DrawerOpen") }}>
              <Icon name="menu" />
            </Button>
          </Left>
          <Body>
            <Title>
              合併／移動儲位
            </Title>
          </Body>
          <Right></Right>
        </Header>
        <Content padder>
          <Card style={styles.mb}>
            <CardItem header bordered>
              <Left>
                <Button bordered light primary style={styles.mb15}
                  onPress={() => {
                    this.source_shelf_sheet.show()

                  }}>
                  <Text>
                    {this.state.source_shelf || "請選擇"}
                  </Text>
                </Button>
              </Left>
              <Label style={styles.center}>
                <Icon name="md-arrow-round-forward"></Icon>
              </Label>
              <Right>
                <Button bordered light primary style={styles.mb15}
                  onPress={() => {
                    this.destination_shelf_sheet.show()

                  }}>
                  <Text>
                    {this.state.destination_shelf || '請選擇'}
                  </Text>
                </Button>
              </Right>
            </CardItem>
          </Card>
          <List>
            {
              this.state.products.map(product => {
                return <ListItem key={product.id}
                  onPress={() => {
                    this.toggle_product(product.id)
                  }}

                >
                  <Left>
                    <CheckBox checked={product.checked} onPress={() => {
                      this.toggle_product(product.id)
                    }
                    } />

                  </Left>
                  <Body>
                    <Text>
                      {product.product_title} {product.expiration_date}
                    </Text>

                  </Body>
                  <Right>
                    <Text>
                      {product.pcs}
                    </Text>
                  </Right>
                </ListItem>

              })
            }
          </List>
          <ActionSheet
            ref={o => this.source_shelf_sheet = o}
            title={<Text style={{ color: '#000', fontSize: 18 }}>請選擇儲位</Text>}
            options={['取消', ...this.state.shelves.filter(s => s.shop_id).map(shelf => {
              if (shelf.token == this.state.source_shelf) {
                return <Text style={[styles.orange, styles.highlight]} > {shelf.token} {shelf.shop_name || ""} </Text>
              }
              return `${shelf.token} ${shelf.shop_name || ""}`
            })]}
            cancelButtonIndex={0}
            onPress={(index) => {
              if (index > 0) {
                this.onSourceSelected(this.state.shelves[index - 1].token)
              }
            }
            }
          />
          <ActionSheet
            ref={o => this.destination_shelf_sheet = o}
            title={<Text style={{ color: '#000', fontSize: 18 }}>請選擇儲位</Text>}
            options={["取消", ...this.state.destination_shelves_candidate.map(shelf => {
              if (shelf.token == this.state.destination_shelf) {
                return <Text style={[styles.orange, styles.highlight]} > {shelf.token} {shelf.shop_id ? '' : " (空)"}</Text>
              }
              return `${shelf.token} ${shelf.shop_id ? '' : " (空)"}`
            })]}
            cancelButtonIndex={0}
            onPress={(index) => {
              if (index > 0) {
                this.setState({ destination_shelf: this.state.destination_shelves_candidate[index - 1].token })
              }
            }
            }
          />
        </Content>
        <View style={styles.footer}>
          { this.valid() ?
            <Button primary full style={[styles.mb15, styles.footer]} onPress={() => {
              this.merge()
            }}>
              <Text>確認移入</Text>
            </Button> : null
           }
        </View>
      </Container>
    );
  }
}

export default ShelfMerge;
