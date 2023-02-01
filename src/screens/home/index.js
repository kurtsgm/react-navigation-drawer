
import React, { Component } from "react";
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { ImageBackground, View, StatusBar } from "react-native";
import { H1, Container, Button, H3, Text, Form, Item, Label, Input, Content, Footer, Right } from "native-base";
import styles from "./styles";
import "react-native-gesture-handler";

import * as AppActions from '../../redux/actions/AppAction'
import { apiFetch, API_OAUTH,GET_ME } from "../../api"
import { Keyboard } from 'react-native'
const launchscreenBg = require("../../../assets/launchscreen-bg.png");
const launchscreenLogo = require("../../../assets/logo-wms.png");
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants'
import { store } from "../../redux/stores/store";

class Home extends Component {
  constructor(props) {
    super(props)
    this.state = {
      username: '',
      password: '',
      login_failed: false,
      logged_in_username: null
    }
    this.login = this.login.bind(this)
    if (__DEV__) {
      this.fast_login = this.fast_login.bind(this)
    }
    this.validateOperator = this.validateOperator.bind(this)
  }
  
  componentDidMount(){
    // if params logOut , call logout
    AsyncStorage.getItem('@authToken').then((access_token)=>{
      if(!!access_token){
        AsyncStorage.getItem('@username').then((username)=>{
          this.props.setToken(access_token,null,username)
        })
      }
    })
  
  }
  
  validateOperator(access_token) {
    this.props.setToken(access_token,null,null)
    apiFetch(GET_ME, {}, (data) => {
      if (data.username) {
        this.props.setToken(access_token, data.role,data.username)
        this.props.setWarehouse(data.warehouse)
        const { navigate } = this.props.navigation;
        AsyncStorage.setItem('@username', data.username)
        navigate('Welcome',data)
      }
    }
    )
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
          // set auth token and roles
          AsyncStorage.setItem('@authToken',data.access_token).then(()=>{
            this.validateOperator(data.access_token)
          })
        } else {
          this.setState({ login_failed: true })
        }
      });
    }
  }

  fast_login() {
    if (__DEV__) {
      AsyncStorage.setItem('@domain',Constants.manifest.debuggerHost.split(":").shift().concat(":3000")).then(()=>{
        
        apiFetch(API_OAUTH, {
          username: 'a',
          password: 'qwertyui',
          grant_type: 'password'
        }, (data) => {
          if (data.access_token) {
            AsyncStorage.setItem('@authToken',data.access_token).then(()=>{
              this.validateOperator(data.access_token)
            })
          } else {
            this.setState({ login_failed: true })
          }
        });
      })
      
    }

  }
  logout(){
    AsyncStorage.removeItem('@authToken').then(()=>{
      this.props.setToken(null,null,null)
      this.props.setWarehouse(null)
      this.setState({logged_in_username:null})
    }
    )
  }
  

  render() {
    return <Container>
        <StatusBar barStyle="light-content" />
        <ImageBackground source={launchscreenBg} style={styles.imageContainer}>
          <Content>
            <View style={styles.logoContainer}>
              <H1 style={styles.text}>
                GoWarehouse
              </H1>
            </View>
            <View >
            { store.getState().username ? 
              <><Button round info
              style={{ marginBottom: 20, alignSelf: "center" }}
              onPress={()=>{
                // login with existing token
                AsyncStorage.getItem('@authToken').then((value)=>{
                  if(!!value){
                    this.validateOperator(value)
                  }
                }
                )
              }}
            >
              <Text>{`以${store.getState().username}身份登入`}</Text>
            </Button>
            <Button round warning
              style={{ marginBottom: 20, alignSelf: "center" }}
              onPress={()=>{
                this.logout()          
              }}
            >
              <Text>{`切換帳號`}</Text>
              </Button>
            </> :
            <>
              <Form>
                <Item fixedLabel >
                  <Label style={styles.text}>帳號</Label>
                  <Input style={styles.text} autoCapitalize="none" onChangeText={(text) => this.setState({ username: text })} />
                </Item>
                <Item fixedLabel>
                  <Label style={styles.text}>密碼</Label>
                  <Input style={styles.text} autoCapitalize="none" secureTextEntry onChangeText={(text) => this.setState({ password: text })} />
                </Item>
                <Item fixedLabel>
                  <Label style={styles.text}>登入網址</Label>
                  <Input style={styles.text} autoCapitalize="none" onChangeText={(text) => {
                    if(text.includes(".")){
                      AsyncStorage.setItem('@domain',text)
                    }else{
                      AsyncStorage.setItem('@domain',`${text}.ibiza.com.tw`)
                    }
                  }
                  } />
                </Item>
                <Label style={styles.center_container}>
                  <Text style={[styles.warning_text, styles.center]}>
                    {this.state.login_failed ? "登入失敗，請檢查帳號密碼" : ""}
                  </Text>
                </Label>

              </Form> 
              <Button round success
                    style={{ marginBottom: 20, alignSelf: "center" }}
                    onPress={this.login}
                  >
                    <Text>登入</Text>
                  </Button>
              {
                __DEV__ ?
                  <Button round success
                    style={{ marginBottom: 20, alignSelf: "center" }}
                    onPress={this.fast_login}
                  >
                    <Text>快速Login(測試用)</Text>
                  </Button> : null

              }
              </>
            }
            </View>
          </Content>
          <Text style={{ backgroundColor: 'transparent',bottom: 0 ,textAlign:'center',paddingBottom: '10%'}} >
            版本: 1.1.59 (2023/02/21)
          </Text>
        </ImageBackground>
      </Container>    
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
