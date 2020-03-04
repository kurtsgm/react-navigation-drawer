import React, { Component } from "react";
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
  List,
  ListItem,
  Item,
  Input
} from "native-base";
import styles from "./styles";

import * as AppActions from '../../redux/actions/AppAction'
import { apiFetch, GET_RECEIPT } from "../../api"


class ShowVerifyReceipt extends Component {
  constructor(props) {
    super(props)
    this.state = {
      items: [],
      barcode: null
    }
    this.reload = this.reload.bind(this)
    this.onBack = this.onBack.bind(this)
  }
  reload() {
    const { receipt } = this.props.navigation.state.params;
    apiFetch(GET_RECEIPT, { id: receipt.id }, (_data) => {
      this.setState({ items: _data.items })
      console.log(_data)
    })
  }

  componentWillMount() {
    this.reload()
  }
  onBack() {
    this.reload()
  }
  render() {
    let rows = []
    const { receipt } = this.props.navigation.state.params;
    this.state.items.filter(item=>{
      if(this.state.barcode){
        return item.product_uid.toUpperCase().includes(this.state.barcode) || (item.product_barcode &&item.product_barcode.toUpperCase().includes(this.state.barcode))
      }
      return true
    }).forEach((item) => {
      rows.push(
        <ListItem key={item.id} button onPress={() => {
          this.props.navigation.navigate("ReceiptVerifyItem", { receipt_id: receipt.id, item_id: item.id, onBack: this.onBack })
        }
        }>
          <Left>
            {item.verified_pcs || item.verified_pcs == 0 ?
              <Icon name="checkmark-circle" style={{ color: "#3ADF00" }} /> : null}
            {item.verified_pcs || item.verified_pcs == 0 ?
              <Text>
                {`${[item.product_name, item.storage_type_name].filter(e => e).join(" ")} [${item.pcs_per_box}入]`}
                {item.expiration_date ? item.expiration_date : ''}
                {`\n應收:${item.scheduled_pcs} 實收:${item.verified_pcs} `}
              </Text>
              :
              <Text>
                {`${[item.product_name, item.storage_type_name].filter(e => e).join(" ")} [${item.pcs_per_box}入]`}
                {item.expiration_date ? item.expiration_date : ''}
                {`\n應收:${item.scheduled_pcs}`}
              </Text>
            }

          </Left>
          <Right>
            <Icon name="arrow-forward" style={{ color: "#999" }} />
          </Right>
        </ListItem>)

    })

    return (
      <Container style={styles.container}>
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
            <Title>入倉驗收</Title>
          </Body>
          <Right>
            <Button transparent>
              <Icon name="refresh" onPress={() => this.reload()} />
            </Button>
          </Right>
        </Header>
        <Content>
          {
            this.state.items.length > 0 ?
              <List>
                <ListItem>
                  <Input placeholder="Search" placeholder="請輸入或者掃描條碼" autoFocus={true}
                    value={this.state.barcode}
                    onFocus={() => this.setState({ barcode: null })}
                    onChangeText={(text) => this.setState({ barcode: text.toUpperCase() })}
                    onEndEditing={
                      (event) => {
                        let barcode = event.nativeEvent.text.trim()
                      }
                    } />
                  <Right>
                    <Button
                      transparent
                      onPress={() =>
                        this.props.navigation.navigate("BarcodeScanner", {
                          onBarcodeScanned: (barcode) => {
                            this.setState({ barcode: barcode })
                          }
                        }
                        )
                      }
                    >
                      <Icon name="camera" />
                    </Button>
                  </Right>
                </ListItem>


                {rows}
              </List> : null
          }
        </Content>
      </Container>
    );
  }
}

export default ShowVerifyReceipt;