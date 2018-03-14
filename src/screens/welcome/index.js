
import React, { Component } from "react";
import {View, Container, H1, Text ,Form,Label ,Content, Header, Left, Right,Button, Icon } from "native-base";
import styles from "./styles";
class Welcome extends Component {
  constructor(props){
    super(props)
  }
  render() {
    return (
      <Container style={styles.container}>
        <Header>
          <Left>
            <Button
              transparent
              onPress={() => this.props.navigation.navigate("DrawerOpen")}
            >
              <Icon name="menu" />
            </Button>
          </Left>
          <Right />
        </Header>

        <Content padder>
          <View style={styles.center_container}>
            <H1 style={[styles.mb10,styles.center]}>登入成功</H1>
          </View>
        </Content>
      </Container>
    );
  }
}

export default Welcome;