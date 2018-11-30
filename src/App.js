import React from "react";
import { Root } from "native-base";
import { StackNavigator, DrawerNavigator } from "react-navigation";
import {StatusBar} from 'react-native'


import Home from "./screens/home/";

// Receipts and Shelves
import Receipt from './screens/receipt'
import ShowReceipt from './screens/receipt/show'
import RecommendShelf from './screens/receipt/recommend'

// PickingLists
import PickingLists from './screens/picking_list'
import ShowPickingList from './screens/picking_list/show'


// Products
import ProductSearch from './screens/products/search'
import ProductStorages from './screens/products/storages'
import ProductShelf from './screens/products/shelf'


// Shelfs

import ShelfSearch from './screens/shelves/search'
import ShelfShow from './screens/shelves/show'
import ShelfMerge from './screens/shelves/merge'
import ShelfProduct from './screens/shelves/product'
import HighLayerShelf from './screens/shelves/high_layer'
import HighLayerShopIndex from './screens/shelves/high_layer_shops'

import HighLayerShelfMerge from './screens/shelves/high_layer_merge'
import Welcome from './screens/welcome/index'

import SideBar from "./screens/sidebar";
const Drawer = DrawerNavigator(
  {
    Home: { screen: Home },
    Receipt: {screen: Receipt},
    PickingLists: {screen:PickingLists},
    ProductSearch: {screen: ProductSearch},
    ShelfSearch: {screen: ShelfSearch},
    ShelfMerge: {screen: ShelfMerge},
    HighLayerShopIndex: {screen: HighLayerShopIndex},
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

const AppNavigator = StackNavigator(
  {
    Drawer: { screen: Drawer },

    ShowReceipt: {screen: ShowReceipt},
    RecommendShelf: {screen: RecommendShelf},

    ShowPickingList: {screen: ShowPickingList},

    ProductStorages: {screen: ProductStorages},
    ProductShelf: {screen: ProductShelf},
    HighLayerShelfMerge: {screen: HighLayerShelfMerge},
    HighLayerShelf: {screen: HighLayerShelf},
    ShelfShow: {screen: ShelfShow},
    ShelfProduct: {screen: ShelfProduct},

  },
  {
    initialRouteName: "Drawer",
    headerMode: "none"
  }
);

export default () =>
  <Root>
    <StatusBar hidden={true} />
    <AppNavigator />
  </Root>;

console.disableYellowBox = true;

