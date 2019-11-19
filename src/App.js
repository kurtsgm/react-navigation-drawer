import React from "react";
import { createAppContainer} from "react-navigation";
import { createDrawerNavigator } from 'react-navigation-drawer'; 
import {createStackNavigator} from 'react-navigation-stack'
import { Root } from "native-base";
import Home from "./screens/home/";

// Receipts and Shelves
import Receipt from './screens/receipt'
import ShowReceipt from './screens/receipt/show'
import RecommendShelf from './screens/receipt/recommend'

import ReceiptVerifyShops from './screens/receipt_verify/shops'
import ReceiptVerifyIndex from './screens/receipt_verify/index'
import ShowVerifyReceipt from './screens/receipt_verify/show'
import ReceiptVerifyItem from './screens/receipt_verify/item'

// PickingLists
import PickingLists from './screens/picking_list'
import ShowPickingList from './screens/picking_list/show'


// Products
import ProductSearch from './screens/products/search'
import ProductStorages from './screens/products/storages'
import ProductShelf from './screens/products/shelf'
// Barcode
import BarcodeScanner from './screens/barcode/scanner'

// Shelfs

import ShelfSearch from './screens/shelves/search'
import ShelfShow from './screens/shelves/show'
import ShelfIndex from './screens/shelves/index'
import ShelfMerge from './screens/shelves/merge'
import ShelfProduct from './screens/shelves/product'
import HighLayerShelf from './screens/shelves/high_layer_shelf'
import HighLayerPickingLists from './screens/shelves/high_layer_picking_lists'
import HighLayerShopIndex from './screens/shelves/high_layer_shops'
import SettingShops from './screens/settings/shops'
import WarehouseCheckout from './screens/shelves/warehouse_checkout'
import WarehouseShelfMerge from './screens/shelves/warehouse_merge'

import HighLayerShelfMerge from './screens/shelves/high_layer_merge'
import Welcome from './screens/welcome/index'

import SideBar from "./screens/sidebar";
const Drawer = createDrawerNavigator(
  {
    Home: { screen: Home },
    Receipt: {screen: Receipt},
    ReceiptVerifyShops: {screen: ReceiptVerifyShops},
    PickingLists: {screen:PickingLists},
    ProductSearch: {screen: ProductSearch},
    ShelfSearch: {screen: ShelfSearch},
    ShelfMerge: {screen: ShelfMerge},
    HighLayerShopIndex: {screen: HighLayerShopIndex},
    WarehouseCheckout: {screen: WarehouseCheckout},
    WarehouseShelfMerge: {screen: WarehouseShelfMerge},
    SettingShops: {screen: SettingShops},
    Welcome: { screen: Welcome},
  },
  {
    initialRouteName: "Home",
    contentOptions: {
      activeTintColor: "#e91e63"
    },
    contentComponent: props => <SideBar {...props} />
  }
);

const AppNavigator = createStackNavigator(
  {
    Drawer: { screen: Drawer },

    ShowReceipt: {screen: ShowReceipt},
    ReceiptVerifyIndex: {screen: ReceiptVerifyIndex},
    ShowVerifyReceipt: {screen: ShowVerifyReceipt},
    ReceiptVerifyItem: {screen: ReceiptVerifyItem},
    RecommendShelf: {screen: RecommendShelf},

    ShowPickingList: {screen: ShowPickingList},
    BarcodeScanner: {screen: BarcodeScanner},

    ProductStorages: {screen: ProductStorages},
    ProductShelf: {screen: ProductShelf},
    HighLayerShelfMerge: {screen: HighLayerShelfMerge},
    HighLayerShelf: {screen: HighLayerShelf},
    HighLayerPickingLists: {screen: HighLayerPickingLists},

    ShelfShow: {screen: ShelfShow},
    ShelfIndex: {screen: ShelfIndex},
    ShelfProduct: {screen: ShelfProduct},

  },
  {
    initialRouteName: "Drawer",
    headerMode: "none"
  }
);

const AppContainer = createAppContainer(AppNavigator);


export default class AppRoot extends React.Component {
  render() {
    return (
      <Root>
        <AppContainer
          ref={nav => {
            this.navigator = nav;
          }}
        />
      </Root>
    );
  }
}


console.disableYellowBox = true;

