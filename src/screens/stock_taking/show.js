import React, { Component } from "react";
import {
  Container,
  Header,
  Title,
  Content,
  Button,
  Icon,
  Left,
  Body,
  Right,
  List,
  ListItem,
  Footer,
  FooterTab,
  Text,
  Input

} from "native-base";
import styles from "./styles";
import Dialog from "react-native-dialog";
import { apiFetch, GET_STOCK_TAKING, GET_PRODUCTS } from "../../api"
import { normalize_shelf_barcode, shelfKeyboardType } from '../../common'
import { Grid, Col, Row } from "react-native-easy-grid";
// import {Text} from 'react-native';
import { Text as ReactText } from 'react-native';
class StockTakingShow extends Component {
  constructor(props) {
    super(props)
    const { params } = this.props.navigation.state;

    this.state = {
      stock_taking: params.stock_taking,
      isModalVisible: false,
      isQuantityModalVisible: false,
      isProductModalVisible: false,
      isProductSelectModalVisible: false,
      currentItemKey: null,
      barcode: null,
      candidateProducts: [],
      searchKeyword: "",
    }
    this.reload = this.reload.bind(this)
    this.onBack = this.onBack.bind(this)
    this.reload()
  }


  reload() {
    let { stock_taking } = this.state
    apiFetch(GET_STOCK_TAKING, { id: stock_taking.id }, (data) => {
      this.setState({ stock_taking: data })
    })
  }


  onBack() {
    this.reload()
  }


  render() {
    let { stock_taking } = this.state

    return (
      <Container style={styles.container}>
        {/* 儲位Dialog */}
        <Dialog.Container visible={this.state.isModalVisible}>
          <Dialog.Title>請輸入儲位</Dialog.Title>
          <Dialog.Input keyboardType={shelfKeyboardType()}
            placeholder='請輸入儲位'
            value={this.state.barcode}
            autoFocus={true}
            style={{ color: 'black' }} //bug fix for android dark mode
            onChangeText={(text) => this.setState({ barcode: normalize_shelf_barcode(text.toUpperCase()) })}
            onFocus={() => this.setState({ barcode: null })}
            onEndEditing={
              (event) => {
                let barcode = normalize_shelf_barcode(event.nativeEvent.text.trim())
                this.setState({ isModalVisible: false })

              }
            }
            returnKeyType="done" />
          <Dialog.Button label="取消" onPress={() => this.setState({ isModalVisible: false })} />
        </Dialog.Container>

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
            <Title>{stock_taking.name}</Title>
          </Body>
          <Right>
            <Button transparent>
              <Icon name="refresh" onPress={() => this.reload()} />
            </Button>
          </Right>
        </Header>
        <Content>
          <List>
            <ListItem>
              <Grid>
                <Col size={4} style={styles.vertical_center} >
                  <Input placeholder="請輸入或者掃描儲位" search
                    value={`${this.state.searchKeyword}`}
                    keyboardType={shelfKeyboardType()}
                    onChangeText={(text) => this.setState({ searchKeyword: normalize_shelf_barcode(text.toUpperCase()) })}
                    textAlign={'center'}
                    onEndEditing={(event) => {
                    }} returnKeyType="done" />
                </Col>
                <Col size={1} style={styles.vertical_center} >
                  <Icon name="search" />
                </Col>
              </Grid>
            </ListItem>
            {
              ((stock_taking.stock_taking_shelves || []).filter(s => {
                if (this.state.searchKeyword) {
                  return s.shelf.token.includes(this.state.searchKeyword)
                } else {
                  return true
                }
              })).map((stock_taking_shelf) => {
                return <ListItem key={stock_taking_shelf.id}>
                  <Grid>
                    <Row>
                      <Col size={1}>
                        {
                          stock_taking_shelf.checked ?
                            <Icon name="checkmark-circle" style={{ color: 'green', top: 8 }} /> :
                            null
                        }
                      </Col>
                      <Col size={4} >
                        <ReactText style={{ fontSize: 24, top: 8 }}  >{stock_taking_shelf.shelf.token}</ReactText>
                      </Col>
                      <Col size={1}>
                        <Button transparent onPress={() => {
                          console.log(stock_taking_shelf)
                          this.props.navigation.navigate("StockTakingShelf", { stock_taking: stock_taking, stock_taking_shelf: stock_taking_shelf, onBack: this.onBack })
                        }}>
                          <Icon name="arrow-forward" />
                        </Button>
                      </Col>
                    </Row>
                  </Grid>
                </ListItem>
              })
            }
          </List>
        </Content>
        <Footer>
          <FooterTab>
            <Button active full bordered onPress={() => {
              this.props.navigation.navigate("BarcodeScanner", {
                onBarcodeScanned: (barcode) => {
                }
              })
            }}>
              <Icon name="camera" /><Text>掃描儲位</Text>
            </Button>
            <Button full active bordered onPress={() => {
              this.setState({ isModalVisible: true })
            }}>
              <Text>輸入儲位</Text>
            </Button>
          </FooterTab>
        </Footer>
      </Container>
    );
  }
}

export default StockTakingShow;