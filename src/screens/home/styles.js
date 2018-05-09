const React = require("react-native");
const { Dimensions, Platform } = React;
const deviceHeight = Dimensions.get("window").height;

export default {
  imageContainer: {
    flex: 1,
    width: null,
    height: null
  },
  logoContainer: {
    flex: 1,
    marginTop: deviceHeight / 10,
    marginBottom: 30,
    alignItems:'center'
  },
  logo: {
    position: "absolute",
    left: Platform.OS === "android" ? 40 : 50,
    top: Platform.OS === "android" ? 35 : 60,
    width: 280,
    height: 50
  },
  text: {
    color: "black",
    bottom: 6,
    marginTop: 5
  },
  warning_text: {
    color: "#F55",
    bottom: 6,
    marginTop: 5
  },
  center: {
    textAlign: "center"
  }
};
