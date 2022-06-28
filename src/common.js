

const SDJ_SHELF_PREFIX = "SDJ-1-"

import {store} from './redux/stores/store'
import {Input} from 'native-base'

export const MIN_SHELF_TOKEN_LENGTH = 8

export function getMinShelfLenghth(){
  return store.warehouse.row_digits + 2 + store.warehouse.delimiter.length * 2
}

export class ShelfInput extends Input{
  render(){
    return <Input 
    returnKeyType="done"
    keyboardType={store.getState().warehouse.all_number ? 'numeric' : 'default'} {...this.props} />
  }
}

export function normalize_date(text){
  let tokens =[]

  if(text.includes('-')){
    tokens = text.split('-').filter(e=> {
      return e
    }).map(e=> e.replace(/\D/g,''))  
    text = tokens.join('')
  }

  tokens[0] = text.substring(0,4)
  tokens[1] = text.substring(4,6)
  if(parseInt(tokens[1]) > 12 || (parseInt(tokens[1]) < 1 && tokens[1].length > 1)){
    tokens[1] = ''
  }
  tokens[2] = text.substring(6,8)
  if(parseInt(tokens[2]) > 31 || (parseInt(tokens[2]) < 1 && tokens[2].length > 1 ) ){
    tokens[2] = ''
  }
  return tokens.filter(t=>t).join('-').toUpperCase()
}


export function normalize_shelf_barcode(barcode){
  let tokens =[]
  let warehouse = store.getState().warehouse
  let delimiter = warehouse.delimiter
  let row_digits = warehouse.row_digits
  if(barcode.includes(delimiter)){
    if(barcode.includes(SDJ_SHELF_PREFIX)){
      barcode = barcode.replace(SDJ_SHELF_PREFIX,"")
    }
    tokens = barcode.split(delimiter).filter(e=> {
      return e
    })

    tokens[0] = String(tokens[0]).padStart(row_digits, '0')
  
    barcode = tokens.join('')
  }

  tokens[0] = barcode.substring(0,row_digits)
  tokens[1] = barcode.substring(row_digits,row_digits+2)
  tokens[2] = barcode.substring(row_digits+2,row_digits+3)
  if(barcode.length> row_digits+3){
    tokens[3] = barcode.substring(row_digits+3,row_digits+6)
  }
  return tokens.filter(t=>t).join(delimiter).toUpperCase()
}

export function getShelfLayer(token){
  let warehouse = store.getState().warehouse
  let delimiter = warehouse.delimiter
  let row_digits = warehouse.row_digits
  if(delimiter){
    tokens = token.split(delimiter).filter(e=>e)
    return parseInt(tokens[2])  
  }else{
    return parseInt(token.substring(row_digits+2,row_digits+3))
  }
}
export function shelfSorter(shelf_a,shelf_b){
  try {
    let warehouse = store.getState().warehouse
    let delimiter = warehouse.delimiter
    let row_digits = warehouse.row_digits
    // replace all delimiter
    shelf_a = shelf_a.replace(/\D/g,'').replace(delimiter, '')
    shelf_b = shelf_b.replace(/\D/g,'').replace(delimiter, '')
  
    let result = shelf_a.substring(0,row_digits+3).localeCompare(shelf_b.substring(0,row_digits+3))
    return result
  } catch (e) {
    console.log(e)
    return 1
  }
}

export function hashColor(str){
  var hash = 0;
  for (var i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  var colour = '#';
  for (var i = 0; i < 3; i++) {
    var value = (hash >> (i * 8)) & 0xFF;
    colour += ('00' + value.toString(16)).substr(-2);
  }
  return colour;
}

export function temperatureColor(str){
  switch(str){
    case '常溫':
      return 'black';
    case '恆溫':
      return 'green';
    case '低溫':
      return 'cyan';
    case '冷凍':
      return 'red';
      
  }
}


export function boxText(box_pcs, quantity) {
  if (box_pcs && box_pcs > 0) {
    let box_text = Math.floor(quantity / box_pcs) > 0 ? `${Math.floor(quantity / box_pcs)}箱` : ''
    let pcs_text = (quantity % box_pcs) > 0 ? `${(quantity % box_pcs)}個` : ''
    return box_text + pcs_text
  }else{
    return `${quantity}個`
  }
}
