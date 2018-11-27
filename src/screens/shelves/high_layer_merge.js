
import React from "react";
import ShelfMerge from './merge'
import {
  Button,
  Icon,
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

  afterMerge(){
    this.props.navigation.state.params.high_layer.onBack()
    this.props.navigation.goBack()
  }
  componentDidMount() {
    if (this.props.navigation.state.params.high_layer) {
      this.setState({high_layer:this.props.navigation.state.params.high_layer})
      this.onSourceSelected(this.props.navigation.state.params.high_layer.shelf_token)
    }
  }

}

export default HighLayerShelfMerge;
