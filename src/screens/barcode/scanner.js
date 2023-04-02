import * as React from 'react';
import { Text, View, StyleSheet, Button } from 'react-native';
import { Constants } from 'expo';
import { BarCodeScanner } from 'expo-barcode-scanner'
import * as Permissions from 'expo-permissions'
import { Audio } from 'expo-av';


export default class BarcodeScanner extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      hasCameraPermission: null,
      scanned: false,
    };
    this.handleBarCodeScanned = this.handleBarCodeScanned.bind(this)
    this.playBeep = this.playBeep.bind(this)
  }

  async componentDidMount() {
    const { status } = await Permissions.askAsync(Permissions.CAMERA);
    this.setState({ hasCameraPermission: status === 'granted' });
  }

  render() {
    const { hasCameraPermission, scanned } = this.state;

    if (hasCameraPermission === null) {
      return <Text>Requesting for camera permission</Text>;
    }
    if (hasCameraPermission === false) {
      return <Text>No access to camera</Text>;
    }
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'flex-end',
        }}>
        <BarCodeScanner
          onBarCodeScanned={scanned ? undefined : this.handleBarCodeScanned}
          style={StyleSheet.absoluteFillObject}
        />

        {scanned && (
          <Button
            title={'Tap to Scan Again'}
            onPress={() => this.setState({ scanned: false })}
          />
        )}
      </View>
    );
  }

  handleBarCodeScanned = ({ type, data }) => {
    this.setState({ scanned: true });
    try{
      // for IOS
      if( type && type.split('.').pop() =='EAN-13'){
        data = data.replace(/^0/, '')
      }  
    }catch(e){
    }
    const { params } = this.props.navigation.state;
    this.playBeep()
    params.onBarcodeScanned(data)
    this.props.navigation.goBack()
  };
  async playBeep(){
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