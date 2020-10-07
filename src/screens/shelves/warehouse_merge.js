import React from "react";
import ShelfMerge from './merge'
import {
  Button,
  Icon,
  Text,
  Left,
  Right,
  Card,
  CardItem,
  Item,
  Picker,
  Toast,
  Label
} from "native-base";
import { View } from 'react-native';
import { apiFetch, GET_WAREHOUSES, GET_TRANSFER_SHELVES, GET_SHELF_INFO } from "../../api"
import { Grid, Col, Row } from "react-native-easy-grid";

class WarehouseShelfMerge extends ShelfMerge {
  constructor(props) {
    super(props)
    this.getWarehouses = this.getWarehouses.bind(this)
    this.onWarehouseChange = this.onWarehouseChange.bind(this)
    this.reloadProgress = this.reloadProgress.bind(this)
    this.title = '調撥接收'
    this.is_warehouse_merge = true
    this.getWarehouses()

  }
  getWarehouses() {
    apiFetch(GET_WAREHOUSES, {}, data => {
      this.setState({ warehouses: data })
    })
  }

  afterMerge() {
    this.reloadProgress()
  }

  reloadProgress() {
    apiFetch(GET_TRANSFER_SHELVES, {
      warehouse_id: this.state.warehouse_id
    }, data => {
      this.setState({
        all_shelves: data.all_shelves,
        progressing_shelves: data.progressing_shelves
      })
    })
  }
  mergeOptions() {
    return { from_warehouse_id: this.state.warehouse_id, unlock_shelf: true }
  }

  onWarehouseChange(id) {
    this.setState({
      warehouse_id: id
    })
    setTimeout(()=>{
      this.reloadProgress()
      // workaround for blocked overlay, strange issue (IOS Picker+Overlay),maybe animation
    },1000)
  }
  onSourceSelected(token) {
    token = token.trim()
    if (!this.state.warehouse_id) {
      Toast.show({
        text: "請選擇來源倉",
        duration: 2500,
        textStyle: { textAlign: "center" }
      })
      return
    }
    if (token) {
      apiFetch(GET_SHELF_INFO, { token: token, warehouse_id: this.state.warehouse_id, locked: true }, data => {
        if (data) {
          this.setSourceData(data)
        } else {
          Toast.show({
            text: "查無資料",
            duration: 2500,
            textStyle: { textAlign: "center" }
          })
        }
      })
    }
  }
  extra_info() {
    return <View><CardItem bordered>
      <Picker mode="dropdown"
        headerBackButtonText="退回"
        style={{ width: 200 }}
        iosHeader="選擇來源倉"
        placeholder="請選擇來源倉"
        iosIcon={<Icon name="arrow-down" />}
        selectedValue={this.state.warehouse_id}
        onValueChange={this.onWarehouseChange}>
        {
          this.state.warehouses ? this.state.warehouses.map(warehouse => {
            return <Picker.Item key={warehouse.id} label={warehouse.title} value={warehouse.id}></Picker.Item>
          }) : null
        }
      </Picker>
    </CardItem>
      {this.state.progressing_shelves && this.state.all_shelves ?
        <CardItem bordered>
          <Grid>
            <Row>
              <Col>
                <Label button onPress={() => {
                  if (this.state.progressing_shelves.length > 0) {
                    this.props.navigation.navigate("ShelfIndex", {
                      shelves: this.state.progressing_shelves.map(receipt_shelf => {
                        return { token: receipt_shelf.source }
                      })
                    })
                  }
                }}>
                  <Text>
                    {`待入庫：${this.state.progressing_shelves.length}`}
                  </Text>
                </Label>
              </Col>
              <Col>
                <Label>
                  {`總板數：${this.state.all_shelves.length}`}
                </Label>
              </Col>
            </Row>
          </Grid>

        </CardItem> : null
      }
    </View>
  }


}

export default WarehouseShelfMerge;
