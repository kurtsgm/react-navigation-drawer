
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
  CheckBox,
  Badge
} from "native-base";
import styles from "./styles";

import { apiFetch, GET_PICKING_LISTS } from "../../api"

import { Grid, Col, Row } from "react-native-easy-grid";

import { hashColor } from '../../common'

class HighLayerPickingLists extends Component {
  constructor(props) {
    super(props)
    const { params } = this.props.navigation.state;
    this.reload = this.reload.bind(this)
    this.state = {
      shop_name: params.shop_name,
      shop_id: params.shop_id,
      picking_lists: params.picking_lists,
      checkedAll:false
    }
    this.togglePicking = this.togglePicking.bind(this)
    this.toggleCheckAll = this.toggleCheckAll.bind(this)
  }
  reload() {
    apiFetch(GET_PICKING_LISTS, { shop_id: this.state.shop_id, ready_to_pick: true }, (_data) => {
      this.setState({ picking_lists: _data })
      console.log(_data)
    })
  }

  toggleCheckAll(){
    let pickings = this.state.picking_lists
    for(let picking of pickings){
      picking.checked = !this.state.checkedAll
    }
    this.setState({checkedAll: !this.state.checkedAll,picking_lists:pickings})
  }

  togglePicking(picking_id) {
    let pickings = this.state.picking_lists
    for (let picking of pickings) {
      if (picking.id == picking_id) {
        picking.checked = !picking.checked
        break
      }
    }
    this.setState({ picking_lists: pickings })
  }

  render() {
    let rows = this.state.picking_lists.map(picking => {
      return <ListItem key={picking.id}
        onPress={() => {
          this.togglePicking(picking.id)
        }}
      >
        <Grid>
          <Col size={1} >
            <CheckBox checked={picking.checked} />
          </Col>
          <Col size={2} >
            <Text>
              {`# ${picking.id}`}
            </Text>
          </Col>
          <Col size={4} >
            <Text>
            {
                picking.shipping_types.map(shipping_type => {
                  return <Badge key={shipping_type}
                    style={{
                      height: 25,
                      backgroundColor: hashColor(shipping_type)
                    }}
                    textStyle={{ color: "white" }}>
                    <Text>{shipping_type}</Text>
                  </Badge>
                })
              }
            </Text>
          </Col>
          <Col size={2} >
            <Text>
              {picking.created_date}
            </Text>
          </Col>

        </Grid>
      </ListItem>
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
            <Title>{`${this.state.shop_name} 揀貨單列表`}</Title>
          </Body>
          <Right>
            <Button transparent>
              <Icon name="refresh" onPress={() => this.reload()} />
            </Button>
          </Right>
        </Header>

        <Content>
          {
            rows.length > 0 ?
              <List>
                <ListItem onPress={() => {
                        this.toggleCheckAll()
                      }
                      } >
                  <Grid>
                    <Col size={1} >
                      <CheckBox checked={this.state.checkedAll} />
                    </Col>
                    <Col size={2} >
                      <Text>
                      </Text>
                    </Col>
                    <Col size={4} >
                      <Text>
                        全選/全不選
                      </Text>
                    </Col>

                  </Grid>
                </ListItem>
                {rows}
                <ListItem>
                  {/* Dummy */}
                </ListItem>
              </List> : null
          }
        </Content>
          <View style={styles.footer}>
            {this.state.picking_lists.filter(p => p.checked).length > 0 ?
              <Button primary full style={[styles.mb15, styles.footer]} onPress={() => {

                this.props.navigation.navigate("HighLayerShelf", { onBack: () => { this.reload() }, shop_id: this.state.shop_id, shop_name: this.state.shop_name, picking_list_ids: this.state.picking_lists.filter(p => p.checked).map(p => p.id) })

              }}>
                <Text>確認</Text>
              </Button> : null
            }
          </View>

      </Container>
    );
  }
}

export default HighLayerPickingLists;