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
  ActionSheet
} from "native-base";


import { Grid, Col } from "react-native-easy-grid";
import { apiFetch, RECEIVE_RECEIPT } from "../../api"
import styles from "./styles";



class RecommendShelf extends Component {
  constructor(props) {
    super(props)
    const { params } = this.props.navigation.state;
    this.state = {
      shelf_id: params.shelf.id,
      shelf_token: params.shelf.token
    }
  }

  receive() {
    items = this.props.navigation.state.params.items.map((item) => {
      if (item.ready_to_receive > 0) {
        return { id: item.id, quantity: item.ready_to_receive }
      }
    }).filter(Boolean);
    apiFetch(RECEIVE_RECEIPT, {
      id: this.props.receipt_id,
      shelf_id: this.state.shelf_id,
      items: items
    }).then((data) => {
      if (data.status == "success") {
        this.props.navigation.state.params.onReceived()
        this.props.navigation.goBack()
      } else {
        console.log(data)
      }
    });
  }
  render() {
    const { back } = this.props.navigation;
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
            <Title>{this.state.receipt_title}</Title>
          </Body>
          <Right>
            <Button transparent>
              <Icon name="refresh" onPress={() => this.reload()} />
            </Button>
          </Right>
        </Header>

        <Content>
          <List>
            <ListItem key="shelf">
              <Left>
                <Text>
                  儲位
              </Text>
              </Left>
              <Button bordered light primary style={styles.mb15}
                onPress={() => {
                  let shelves = this.props.navigation.state.params.shelves.map(i => i.token)
                  ActionSheet.show(
                    {
                      options: shelves,
                      title: "重選儲位"
                    },
                    buttonIndex => {
                      this.setState({
                        shelf_id: this.props.navigation.state.params.shelves[buttonIndex].id,
                        shelf_token: this.props.navigation.state.params.shelves[buttonIndex].token})
                    }
                  )
                }}>
                <Text>
                  {this.state.shelf_token}
                </Text>
              </Button>
            </ListItem>

            {this.props.navigation.state.params.items.map(data => {
              return <ListItem key={data.id}>
                <Left>
                  <Left>
                    <Text>
                      {data.product_name + " " + data.product_type_name}
                    </Text>
                  </Left>
                </Left>
                <Text>
                  {data.ready_to_receive}
                </Text>
              </ListItem>
            })
            }
          </List>
          <Button primary block style={styles.mb15} onPress={() => {
            this.receive()
          }}>
            <Text>確認入倉</Text>
          </Button>

        </Content>
      </Container>
    );
  }
}

export default RecommendShelf;
