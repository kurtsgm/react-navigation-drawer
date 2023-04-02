import * as React from 'react';
import {  View, StyleSheet } from 'react-native';
import { Constants } from 'expo';
import { BarCodeScanner } from 'expo-barcode-scanner'
import * as Permissions from 'expo-permissions'
import { Audio } from 'expo-av';
import styles from './styles'
import {Container} from 'native-base'
import {Button,Text} from 'native-base'

export default class BatchBarcodeScanner extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      hasCameraPermission: null,
      scannedBarcodes: new Set(),
    };
    this.handleBarCodeScanned = this.handleBarCodeScanned.bind(this)
    this.playBeep = this.playBeep.bind(this)
  }

  async componentDidMount() {
    const { status } = await Permissions.askAsync(Permissions.CAMERA);
    this.setState({ hasCameraPermission: status === 'granted' });
  }

  render() {
    const { hasCameraPermission } = this.state;

    if (hasCameraPermission === null) {
      return <Text>Requesting for camera permission</Text>;
    }
    if (hasCameraPermission === false) {
      return <Text>No access to camera</Text>;
    }
    
    return (<Container style={styles.container}>
      <View style={{
        flex: 6,
        top: 50
      }}>
        {
          [...this.state.scannedBarcodes].map((barcode) => {
            return <Text key={barcode}>{barcode}</Text>
          })
        }
      </View>

      <View style={{
        flex: 3
      }}>
        <BarCodeScanner
          onBarCodeScanned={this.handleBarCodeScanned}
          style={StyleSheet.absoluteFillObject}
        />
      </View>
      <View >
        <Button primary full style={{ height:70}}
          onPress={() => {
            const { params } = this.props.navigation.state;
            params.onBarcodeScanned(this.state.scannedBarcodes)
            this.props.navigation.goBack()
          }}
          
        >
          <Text>完成掃描</Text>
          </Button>
      </View>
    </Container>
    );
  }

  handleBarCodeScanned = ({ type, data }) => {
    this.setState({ scanned: true });
    try {
      // for IOS
      if (type && type.split('.').pop() == 'EAN-13') {
        data = data.replace(/^0/, '')
      }
    } catch (e) {
    }

    if(!this.state.scannedBarcodes.has(data)){
      this.playBeep()
      
      this.setState({ scannedBarcodes: this.state.scannedBarcodes.add(data) });
    }
  };

  async playBeep(){
    // const { sound } = await Audio.Sound.createAsync( require('./beep.mp3')
    // );
    // await sound.playAsync();
    // await sound.unloadAsync();
    if(this.state.sound){
      await this.state.sound.unloadAsync();
    }
    try {
      const sound = new Audio.Sound();
      await sound.loadAsync(require('./beep.mp3'));
      await sound.playAsync();
      this.setState({ sound: sound })    
    } catch (error) {
    }
  }
}