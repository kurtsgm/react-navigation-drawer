import React from "react";
import ShelfMerge from '../shelves/merge'
import {
  Button,
  Icon,
  Text,
  Left,
  Right,
  CardItem
} from "native-base";


class ReplenishmentMerge extends ShelfMerge {
  backButton() {
    return <Button
      transparent
      onPress={() => {
        this.props.navigation.state.params.onBack()
        this.props.navigation.goBack()
      }
      }
    >
      <Icon name="arrow-back" />
    </Button>
  }

  isLayerOne(){
    return false
  }
  
  afterMerge() {
    this.props.navigation.state.params.onBack()
    this.props.navigation.goBack()
  }
  componentDidMount() {
    const { params } = this.props.navigation.state;
    const { destination_shelf, source_shelf } = params
    this.setState({ destination_shelf: destination_shelf,source_shelf:source_shelf })
    this.onSourceSelected(source_shelf)
  }

}

export default ReplenishmentMerge;
