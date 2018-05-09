import React, { Component } from "react";
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import * as AppActions from '../../redux/actions/AppAction'

import { Image } from "react-native";
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
const drawerImage = require("../../../assets/logo-kitchen-sink.png");
const datas = [
  {
    name: '入倉作業',
    route: 'Receipt',
    icon: 'truck',
    bg: "#C5F442"
  },
  {
    name: '揀貨作業',
    route: 'PickingLists',
    icon: 'clipboard',
    bg: "#C5F442"
  },

  {
    name: '庫存查詢',
    route: 'ProductSearch',
    icon: 'cube',
    bg: "#C5F442"
  },
  {
    name: '儲位查詢',
    route: 'ShelfSearch',
    icon: 'search',
    bg: "#C5F442"
  },
  {
    name: '儲位移動',
    route: 'ShelfMerge',
    icon: 'cubes',
    bg: "#C5F442"

  },


  {
    name: "登出",
    route: 'Logout',
    icon: 'sign-out',
    bg: ''
  }
];

class SideBar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      shadowOffsetWidth: 1,
      shadowRadius: 4,
    };
    this.route = this.route.bind(this)
  }

  route(route){
    if(route == 'Logout'){
      this.props.setToken(null)
      this.props.navigation.navigate("Home")
    }else{
      this.props.navigation.navigate(route)
    }
  }
  componentWillUpdate(){
    if(this.props.auth_token == null){
      this.props.navigation.navigate("Home")
    }
  }
  render() {
    return (
      <Container>
        <Content
          bounces={false}
          style={{ flex: 1, backgroundColor: "#fff", top: -1 }}
        >
          <Image source={drawerCover} style={styles.drawerCover} />
          <Image square style={styles.drawerImage} source={drawerImage} />

          <List
            dataArray={datas}
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
export default connect((state)=>{return {auth_token: state.auth_token}}, mapDispatchToProps)(SideBar);
