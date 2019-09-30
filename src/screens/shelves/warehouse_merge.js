import React from "react";
import ShelfMerge from './merge'
import {
  Button,
  Icon,
  Text,
  Left,
  Right,
  CardItem,
  Item,
  Picker,
  Toast
} from "native-base";

import { apiFetch, GET_WAREHOUSES, GET_SHELF_INFO } from "../../api"

class WarehouseShelfMerge extends ShelfMerge {
  constructor(props) {
    super(props)
    this.get_warehouses = this.get_warehouses.bind(this)
    this.onWarehouseChange = this.onWarehouseChange.bind(this)
    this.title = '調撥接收'
    this.is_warehouse_merge = true
  }
  get_warehouses() {
    apiFetch(GET_WAREHOUSES, {}, data => {
      this.setState({ warehouses: data })
    }
    )
  }
  mergeOptions(){
    return {from_warehouse_id:this.state.warehouse_id,unlock_shelf:true}
  }

  onWarehouseChange(id) {
    this.setState({
      warehouse_id: id
    });
  }
  onSourceSelected(token) {
    token = token.trim()
    if(!this.state.warehouse_id){
      Toast.show({
        text: "請選擇來源倉",
        duration: 2500,
        textStyle: { textAlign: "center" }
      })
      return
    }
    if (token) {
      apiFetch(GET_SHELF_INFO, { token: token,warehouse_id: this.state.warehouse_id,locked: true }, data => {
        if (data) {
          console.log("GET DATA")
          console.log(data)
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
    return <CardItem bordered>
        <Picker mode="dropdown"
          headerBackButtonText="退回"
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
  }

  componentWillMount() {
    this.get_warehouses()
  }

}

export default WarehouseShelfMerge;
