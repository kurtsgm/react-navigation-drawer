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
  ListItem
} from "native-base";
import styles from "./styles";

import * as AppActions from '../../redux/actions/AppAction'
import { apiFetch, GET_RECEIPT } from "../../api"


class ShowVerifyReceipt extends Component {
  constructor(props) {
    super(props)
    this.state = {
      items: []
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
    this.state.items.forEach((item) => {
      console.log('item')
      console.log(item)
      rows.push(
        <ListItem key={item.id} button onPress={() => {
          this.props.navigation.navigate("ReceiptVerifyItem", { receipt_id: receipt.id,item_id: item.id, onBack: this.onBack })
        }
        }>
          <Left>
            {item.verified_pcs ?
              <Icon name="checkmark-circle" style={{ color: "#3ADF00" }} /> : null}
            {item.verified_pcs ?
              <Text>
                {`${[item.product_name,item.storage_type_name].filter(e=>e).join(" ")} [${item.pcs_per_box}入]`}
                {item.expiration_date ? item.expiration_date : ''}
                {`\n應收:${item.scheduled_pcs} 實收:${item.verified_pcs} `}
              </Text>
              :
              <Text>
                {`${[item.product_name,item.storage_type_name].filter(e=>e).join(" ")} [${item.pcs_per_box}入]`}
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
                {rows}
              </List> : null
          }
        </Content>
      </Container>
    );
  }
}

export default ShowVerifyReceipt;