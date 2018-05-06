
import React, { Component } from "react";
import { View ,Alert} from 'react-native';
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
  Card,
  CardItem,
  Input,
  Item
} from "native-base";
import styles from "./styles";

class ShelfProduct extends Component {
  constructor(props) {
    super(props)
    this.state = {
      pcs: this.props.navigation.state.params.pcs,
      dirty: false
    }
    this.adjust = this.adjust.bind(this)
  }

  adjust(){

  }
  render() {
    const { params: storage } = this.props.navigation.state;
    console.log(this.state)
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
            <Text>
              {storage.product_storage.product.name}            
            </Text>
          </Body>
          <Right>
          </Right>
        </Header>

        <Content padder>
          <Card style={styles.mb}>
            <CardItem bordered>
              <Left>
                <Body>
                  <Text>{storage.product_storage.product.name}</Text>
                </Body>
              </Left>
            </CardItem>

            <CardItem>
              <Left>
                <Text>條碼</Text>
              </Left>
              <Right>
              <Text>{storage.product_storage.product.barcode}</Text>
              </Right>
            </CardItem>
            <CardItem>
              <Left>
                <Text>倉別</Text>
              </Left>
              <Right>
              <Text>{storage.product_storage.storage_type_name}</Text>
              </Right>
            </CardItem>
            <CardItem>
              <Left>
                <Text>效期</Text>
              </Left>
              <Right>
              <Text>{storage.product_storage.expiration_date}</Text>
              </Right>
            </CardItem>
            <CardItem>
              <Left>
                <Text>批號</Text>
              </Left>
              <Right>
              <Text>{storage.product_storage.batch}</Text>
              </Right>
            </CardItem>
            <CardItem>
              <Left>
                <Text>數量</Text>
              </Left>
              <Right>
              <Item success >
              <Input keyboardType='numeric' textAlign={'right'} 
              value={`${this.state.pcs}`}
              onChangeText={
                (text) => {
                  this.setState({pcs:text})
                }
              }
              onEndEditing={(event) => {this.setState({dirty:true})}} 
              returnKeyType="done" />

              </Item>

              
              </Right>
            </CardItem>

          </Card>
        </Content>
        <View style={styles.footer}>
          { this.state.dirty ?
            <Button primary full style={[styles.mb15, styles.footer]} onPress={() => {
              this.adjust()
            }}>
              <Text>確認修改</Text>
            </Button> : ''
           }
        </View>
      </Container>
    );
  }
}

export default ShelfProduct;