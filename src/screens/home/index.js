
import React, { Component } from "react";
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { ImageBackground, View, StatusBar } from "react-native";
import { H1,Container, Button, H3, Text ,Form, Item, Label ,Input ,Content } from "native-base";
import * as AppActions from '../../redux/actions/AppAction'

import styles from "./styles";



const launchscreenBg = require("../../../assets/launchscreen-bg.png");
const launchscreenLogo = require("../../../assets/logo-kitchen-sink.png");

class Home extends Component {
  constructor(props){
    super(props)
    this.state = {
      username: '',
      password: '',
      login_failed: false,
    }
    this.login = this.login.bind(this)
  }
  login(){
    const { navigate } = this.props.navigation;
    console.log(this.props.auth_token)
    if(this.state.username && this.state.password){
      let url = __DEV__  ? "http://192.168.1.109:3000/oauth/token" : ""
      fetch(url, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: this.state.username,
          password: this.state.password,
          grant_type: 'password'
          }
        )
      }).then(function(response) {
        return response.json();
      }).then((data)=>{
        if(data.access_token){
          this.props.setToken(data.access_token)
          navigate('Welcome')            
        }else{
          this.setState({login_failed: true})
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
                <Item fixedLabel>
                  <Label>Username</Label>
                  <Input onChangeText={(text) => this.setState({username: text})}/>
                </Item>
                <Item fixedLabel last>
                  <Label>Password</Label>
                  <Input secureTextEntry onChangeText={(text) => this.setState({password: text})}/>
                </Item>
                <Label style={styles.center_container}>
                  <Text style={[styles.warning_text,styles.center]}>
                    { this.state.login_failed ? "登入失敗，請檢查帳號密碼" : ""}
                  </Text>
                </Label>
                
              </Form>
              <Button
                style={{ backgroundColor: "#6FAF98", alignSelf: "center" }}
                onPress={ this.login }
              >
              <Text>Login</Text>
              </Button>
            </View>
          </Content>
        </ImageBackground>
      </Container>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    auth_token: state.auth_token
  }
}
const mapDispatchToProps = (dispatch) => {
  return bindActionCreators(AppActions, dispatch);
}
export default connect(mapStateToProps, mapDispatchToProps)(Home);
