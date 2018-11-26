
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
  Label
} from "native-base";
import styles from "./styles";

import * as AppActions from '../../redux/actions/AppAction'
import { apiFetch, GET_HIGH_LAYER } from "../../api"



class HighLayerShelf extends Component {
  constructor(props) {
    super(props)
    this.state = {
      high_layers: []
    }
    this.reload = this.reload.bind(this)
  }
  componentWillMount() {
    this.reload()
  }
  reload() {
    apiFetch(GET_HIGH_LAYER,{},(_data) => {
      console.log(_data)
      this.setState({high_layers: _data})
    })
  }


  render() {
    let rows = this.state.high_layers.map(shelf=>{
      shelf.onBack = ()=>{this.reload()}
      return <ListItem key={`${shelf.shelf_id}-${shelf.product}`} button onPress={() =>
        this.props.navigation.navigate("HighLayerShelfMerge",{high_layer:shelf})}>
        <Body>
          <Text>
            {shelf.shelf_token}
          </Text>
        </Body>
        <Body>
          <Text>
          {`${shelf.product}/${shelf.storage_type_name}`}

          </Text>
        </Body>
        <Right>
          <Button disabled={true} primary transparent>
          <Text>
          {shelf.shelf_quantity}
          </Text>
          <Icon name="arrow-forward" style={{ color: "#999" }} />

          </Button>
        </Right>
      </ListItem>
    })


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
          <Body>
            <Title>高空待撿</Title>
          </Body>
          <Right>
            <Button transparent>
              <Icon name="refresh" onPress={() => this.reload()} />
            </Button>
          </Right>
        </Header>

        <Content>
          {
            rows.length > 0 ?
              <List>
                {rows}
              </List> : null
          }
        </Content>
      </Container>
    );
  }
}

export default HighLayerShelf;