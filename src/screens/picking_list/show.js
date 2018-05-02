import React, { Component } from "react";
import { Alert, View } from 'react-native';
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
  ActionSheet,
  Input,
  Footer
} from "native-base";



import { Grid, Col } from "react-native-easy-grid";
import { apiFetch} from "../../api"
import styles from "./styles";

const MODE_PICK_ALL = "集結"
const MODE_PICK_BY_ORDER = "播種"

class ShowPickingList extends Component {
  constructor(props) {
    super(props)
    const { params } = this.props.navigation.state;
    this.state = {
      picking_list: params,
      items: ShowPickingList.arrange_items([],params.items),
      mode: MODE_PICK_ALL
    }
    this.changeQuantity = this.changeQuantity.bind(this)
  }

  static arrange_items(items,original_items){
    let results = []
    for(element of original_items) {
      let quantity = element.quantity
      for(shelf of element.shelves){
        if(quantity > 0 && shelf.pcs > 0 ){
          let found_item = null
          let ready_to_pick = Math.min(shelf.pcs, quantity)
          for(exisiting_item of items){
            if(shelf.storage_shelf_id == exisiting_item.storage_shelf_id){
              found_item = exisiting_item
              if(!found_item.manual_set){
                found_item.ready_to_pick = ready_to_pick
              }
              break
            }
          }
          if(!found_item){
            found_item = {
              ready_to_pick: ready_to_pick,
              current_shelf: shelf.token,
              storage_shelf_id: shelf.storage_shelf_id,
              shelves: element.shelves,
              product_name: element.product_name,
              product_type_name: element.product_type_name,
              product_storage_id: element.product_storage_id,
              manual_set: false}
          }
          results.push(found_item)
          quantity -= found_item.ready_to_pick
        }
      }
    }
    console.log(results)
    return results
  }

  changeQuantity(storage_shelf_id,quantity){
    let items = this.state.items
    let target = null
    let total_quantity = 0
    for(item of items){
      if(item.storage_shelf_id == storage_shelf_id){
        target = item
      }
    }
    total_quantity = this.state.picking_list.items.reduce((value,i)=>{
      return i.product_storage_id == target.product_storage_id ? value+i.quantity : value
    },0)
    target.ready_to_pick = Math.min(quantity,total_quantity)
    target.manual_set = true

    this.setState({items:ShowPickingList.arrange_items(this.state.items,this.state.picking_list.items)})
    return target.ready_to_pick
  }

  render() {
    let picking_list = this.state.picking_list
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
            <Title>{picking_list.shop_name} {picking_list.id}</Title>
          </Body>
          <Right>
            <Button bordered primary small>
            <Text>
            {this.state.mode}
            </Text>
            </Button>
          </Right>
        </Header>
        <Content>
          <List>
            {this.state.items.map((data,index )=> {
              console.log(data.ready_to_pick)
              return <ListItem key={data.storage_shelf_id}>
                <Grid>
                  <Col size={4} style={styles.vertical_center} >
                    <Text style={styles.storage_title} >
                      {data.product_name}
                    </Text>
                  </Col>
                  <Col size={2} style={styles.vertical_center} >
                  <Text>
                    {data.current_shelf} / {data.storage_shelf_id}
                  </Text>
                  </Col>
                  <Col size={2} style={styles.vertical_center} >
                  <Input keyboardType='numeric' onEndEditing={(event)=>{
                    let value = this.changeQuantity(data.storage_shelf_id,event.nativeEvent.text)
                    event.nativeEvent.text = value
                    console.log(event.nativeEvent.text)
                  }} value={`${data.ready_to_pick }`} returnKeyType="done"/>
                  </Col>
                  <Col size={2} style={styles.vertical_center} >
                    <Button primary>
                      <Text>確認</Text>
                    </Button>
                  </Col>
                </Grid>
              </ListItem>
            })
            }
          </List>
        </Content>
      </Container>
    );
  }
}

export default ShowPickingList;
