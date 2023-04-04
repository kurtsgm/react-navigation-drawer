import * as React from 'react';
import { View, StyleSheet } from 'react-native';
import { Constants } from 'expo';
import { BarCodeScanner } from 'expo-barcode-scanner'
import * as Permissions from 'expo-permissions'
import { Audio } from 'expo-av';
import styles from './styles'
import { Container } from 'native-base'
import { Button, Text, Badge ,List,Content,Toast} from 'native-base'

export default class BatchBarcodeScanner extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      hasCameraPermission: null,
      scannedBarcodes: new Set(this.props.navigation.state.params.scannedBarcodes || []),
    };
    this.handleBarCodeScanned = this.handleBarCodeScanned.bind(this)
    this.playBeep = this.playBeep.bind(this)
  }

  async componentDidMount() {
    const { status } = await Permissions.askAsync(Permissions.CAMERA);
    this.setState({ hasCameraPermission: status === 'granted' });
  }

  render() {
    const { hasCameraPermission ,scanned} = this.state;

    if (hasCameraPermission === null) {
      return <Text>Requesting for camera permission</Text>;
    }
    if (hasCameraPermission === false) {
      return <Text>請授權相機權限</Text>;
    }

    return (<Container style={styles.container}>
      <View style={{
        flex: 3
      }}>
        <BarCodeScanner
          onBarCodeScanned={scanned ? undefined : this.handleBarCodeScanned}
          style={StyleSheet.absoluteFillObject}
        />
      </View>
      <View style={{
        flex: 6,
      }}>
      <Content>
        {
          [...this.state.scannedBarcodes].reverse().map((barcode) => {
            return <Button bordered  transparent small block key={barcode}
              onPress={
                () => {
                  this.state.scannedBarcodes.delete(barcode)
                  this.setState({ scannedBarcodes: this.state.scannedBarcodes })
                }
              }
            ><Text key={barcode}>{barcode}</Text>

              </Button>
          })
        }
      </Content>
      </View>
      <View >
        <Button primary full style={{ height: 70 }}
          onPress={() => {
            const { params } = this.props.navigation.state;
            params.onBarcodeScanned([...this.state.scannedBarcodes])
            this.props.navigation.goBack()
          }}
        >
          <Text>{`共${this.state.scannedBarcodes.size}筆，完成掃描`}</Text>
        </Button>
      </View>

    </Container>
    );
  }

  handleBarCodeScanned = ({ type, data }) => {
    this.setState({ scanned: true });
    // wait 1 second before setting scanned to false
    setTimeout(() => this.setState({ scanned: false }), 1000);
    try {
      // for IOS
      if (type && type.split('.').pop() == 'EAN-13') {
        data = data.replace(/^0/, '')
      }
    } catch (e) {
    }
    this.playBeep()
    if (this.state.scannedBarcodes.has(data)) {
      Toast.show({
        text: "重複條碼",
        duration: 2500,
        textStyle: { textAlign: "center" }
      })
    }else{
      this.setState({ scannedBarcodes: this.state.scannedBarcodes.add(data) });
    }
  };

  async playBeep() {
    // const { sound } = await Audio.Sound.createAsync( require('./beep.mp3')
    // );
    // await sound.playAsync();
    // await sound.unloadAsync();
    if (this.state.sound) {
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