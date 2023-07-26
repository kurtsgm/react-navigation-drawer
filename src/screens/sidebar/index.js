import React, { Component } from "react";
import {store} from '../../redux/stores/store'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import * as AppActions from '../../redux/actions/AppAction'
import Spinner from 'react-native-loading-spinner-overlay';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Image ,Linking} from "react-native";
import {
  Content,
  Text,
  List,
  ListItem,
  Container,
  Left,
  Right,
  Badge
} from "native-base";
import styles from "./style";
import Icon from 'react-native-vector-icons/FontAwesome'

const drawerCover = require("../../../assets/drawer-cover.png");
const drawerImage = require("../../../assets/logo-wms.png");
const datas = [
  {
    // FontAwesome icons
    name: '入倉驗收',
    route: 'ReceiptVerifyShops',
    icon: 'check-circle',
    bg: "#C5F442",
    roles: ['admin','manager','staff','parttime']
  },
  {
    name: '入倉作業',
    route: 'ReceiptShops',
    icon: 'truck',
    bg: "#C5F442",
    roles: ['admin','manager','staff','parttime']
  },
  {
    name: '揀貨作業',
    route: 'PickingListShops',
    icon: 'clipboard',
    bg: "#C5F442",
    roles: ['admin','manager','staff','parttime']
  },
  {
    name: '揀補作業',
    route: 'ReplenishmentShopIndex',
    icon: 'plus-square',
    bg: "#C5F442",
    roles: ['admin','manager','staff','parttime']
  },
  {
    name: '庫存查詢',
    route: 'ProductSearch',
    icon: 'cube',
    bg: "#C5F442",
    roles: ['admin','manager','staff','parttime']
  },
  {
    name: '儲位查詢',
    route: 'ShelfSearch',
    icon: 'search',
    bg: "#C5F442",
    roles: ['admin','manager','staff','parttime']
  },
  {
    name: '儲位移動',
    route: 'ShelfMerge',
    icon: 'cubes',
    bg: "#C5F442",
    roles: ['admin','manager','staff','parttime']

  },
  {
    name: '高空待撿',
    route: 'HighLayerShopIndex',
    icon: 'flash',
    bg: "#C5F442",
    roles: ['admin','manager','staff','parttime']

  },
  {
    name: '盤點作業',
    route: 'StockTakingIndex',
    icon: 'check-square-o',
    bg: "#C5F442",
    roles: ['admin','manager','staff','parttime']
  },
  { 
    name: '調撥出庫',
    route: 'WarehouseCheckout',
    icon: 'expand',
    bg: "#C5F442",
    roles: ['admin','manager','staff','parttime']
  },
  { 
    name: '調撥接收',
    route: 'WarehouseShelfMerge',
    icon: 'compress',
    bg: "#C5F442",
    roles: ['admin','manager','staff','parttime']
  },

  { 
    name: '關聯客戶',
    route: 'SettingShops',
    icon: 'cog',
    bg: "#C5F442",
    roles: ['admin','manager','staff','parttime']
  },
  {
    name: "登出",
    route: 'Logout',
    icon: 'sign-out',
    bg: '',
    roles: ['admin','manager','staff','parttime']

  }
];

class SideBar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      shadowOffsetWidth: 1,
      shadowRadius: 4,
      loading: false
    };
    this.route = this.route.bind(this)
    if(this.props.auth_token == null){
      this.props.navigation.navigate("Home")
    }
  }

  route(route){
    if(route == 'Logout'){
      // clear authToken
      AsyncStorage.removeItem('@authToken')
      // set auth token to null
      this.props.setToken(null,null,null)
      this.props.navigation.navigate("Home")
    }else{
      this.props.navigation.navigate(route)
    }
  }
  render() {
    return (
      <Container>
        <Spinner visible={this.props.loading} textContent={"資料讀取中"} textStyle={{color: '#FFF'}} />
        <Content
          bounces={false}
          style={{ flex: 1, backgroundColor: "#fff", top: -1 }}
        >
          <Image source={drawerCover} style={styles.drawerCover} />
          <Image square style={styles.drawerImage} source={drawerImage} />

          <List
            dataArray={datas.filter(route=> route.roles.includes(this.props.role))}
            renderRow={data =>
              <ListItem
                button
                noBorder
                onPress={() => this.route(data.route) }
              >
                <Left>
                  <Icon
                    active
                    name={data.icon}
                    style={{ color: "#777", fontSize: 26, width: 30 }}
                  />
                  <Text style={styles.text}>
                    {data.name}
                  </Text>
                </Left>
                {data.types &&
                  <Right style={{ flex: 1 }}>
                    <Badge
                      style={{
                        borderRadius: 3,
                        height: 25,
                        width: 72,
                        backgroundColor: data.bg
                      }}
                    >
                      <Text
                        style={styles.badgeText}
                      >{`${data.types} Types`}</Text>
                    </Badge>
                  </Right>}
              </ListItem>}
          />
        </Content>
      </Container>
    );
  }
}
const mapDispatchToProps = (dispatch) => {
  return bindActionCreators(AppActions, dispatch);
}
export default connect((state)=>{return {auth_token: state.auth_token,role: state.role,loading: state.loading}}, mapDispatchToProps)(SideBar);
