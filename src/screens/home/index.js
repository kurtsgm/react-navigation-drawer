
import React, { Component } from "react";
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { ImageBackground, View, StatusBar } from "react-native";
import { H1, Container, Button, H3, Text, Form, Item, Label, Input, Content, Footer, Right } from "native-base";
import styles from "./styles";
import "react-native-gesture-handler";

import * as AppActions from '../../redux/actions/AppAction'
import { apiFetch, API_OAUTH } from "../../api"
import { Keyboard } from 'react-native'
const launchscreenBg = require("../../../assets/launchscreen-bg.png");
const launchscreenLogo = require("../../../assets/logo-wms.png");

class Home extends Component {
  constructor(props) {
    super(props)
    this.state = {
      username: '',
      password: '',
      login_failed: false,
    }
    this.login = this.login.bind(this)
    if (__DEV__) {
      this.fast_login = this.fast_login.bind(this)
    }
  }
  login() {
    const { navigate } = this.props.navigation;
    if (this.state.username && this.state.password) {
      Keyboard.dismiss()
      apiFetch(API_OAUTH, {
        username: this.state.username,
        password: this.state.password,
        grant_type: 'password'
      }, (data) => {
        if (data.access_token) {
          this.props.setToken(data.access_token, data.role)
          navigate('Welcome')
        } else {
          this.setState({ login_failed: true })
        }
      });
    }
  }

  fast_login() {
    if (__DEV__) {
      const { navigate } = this.props.navigation;
      apiFetch(API_OAUTH, {
        username: 'a',
        password: 'qwertyui',
        grant_type: 'password'
      }, (data) => {
        if (data.access_token) {
          this.props.setToken(data.access_token, data.role)
          navigate('Welcome')
        } else {
          this.setState({ login_failed: true })
        }
      });
    }

  }

  render() {
    return (
      <Container>
        <StatusBar barStyle="light-content" />
        <ImageBackground source={launchscreenBg} style={styles.imageContainer}>
          <Content>
            <View style={styles.logoContainer}>
              <H1 style={styles.text}>
                倉儲管理系統
              </H1>
            </View>
            <View>
              <Form>
                <Item fixedLabel >
                  <Label style={styles.text}>帳號</Label>
                  <Input style={styles.text} autoCapitalize="none" onChangeText={(text) => this.setState({ username: text })} />
                </Item>
                <Item fixedLabel>
                  <Label style={styles.text}>密碼</Label>
                  <Input style={styles.text} autoCapitalize="none" secureTextEntry onChangeText={(text) => this.setState({ password: text })} />
                </Item>
                <Label style={styles.center_container}>
                  <Text style={[styles.warning_text, styles.center]}>
                    {this.state.login_failed ? "登入失敗，請檢查帳號密碼" : ""}
                  </Text>
                </Label>

              </Form>
              {
                __DEV__ ?
                  <Button
                    style={{ backgroundColor: "#6FAF98", alignSelf: "center" }}
                    onPress={this.fast_login}
                  >
                    <Text>快速Login(測試用)</Text>
                  </Button> : <Button
                    style={{ backgroundColor: "#6FAF98", alignSelf: "center" }}
                    onPress={this.login}
                  >
                    <Text>登入</Text>
                  </Button>

              }

            </View>
          </Content>
          <Text style={{ backgroundColor: 'transparent',bottom: 0 ,textAlign:'right'}} >
            版本: 1.1.20 (2020/09/08) 
          </Text>
        </ImageBackground>
      </Container>
    );
  }
}


const mapStateToProps = (state) => {
  return {
    auth_token: state.auth_token,
    role: state.role
  }
}
const mapDispatchToProps = (dispatch) => {
  return bindActionCreators(AppActions, dispatch);
}
export default connect(mapStateToProps, mapDispatchToProps)(Home);
