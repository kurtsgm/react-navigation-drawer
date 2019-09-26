import React from "react";
import ShelfMerge from './merge'
import {
  Button,
  Icon,
  Text,
  Left,
  Right,
  CardItem
} from "native-base";


class HighLayerShelfMerge extends ShelfMerge {
  backButton() {
    return <Button
      transparent
      onPress={() => {
        this.props.navigation.state.params.high_layer.onBack()
        this.props.navigation.goBack()
      }
      }
    >
      <Icon name="arrow-back" />
    </Button>
  }

  extra_info() {
    let high_layer = this.state.high_layer
    return high_layer && high_layer.low_layer_shelf ? <CardItem bordered>
      <Left>
        <Text>低位儲</Text>
      </Left>
      <Right>
        <Text>{high_layer.low_layer_shelf}</Text>
      </Right>
    </CardItem> : null
  }

  afterMerge() {
    this.props.navigation.state.params.high_layer.onBack()
    this.props.navigation.goBack()
  }
  componentDidMount() {
    if (this.props.navigation.state.params.high_layer) {
      this.setState({ high_layer: this.props.navigation.state.params.high_layer })
      this.onSourceSelected(this.props.navigation.state.params.high_layer.shelf_token.nu)
    }
  }

}

export default HighLayerShelfMerge;
