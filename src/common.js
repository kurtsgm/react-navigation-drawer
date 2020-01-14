

const SDJ_SHELF_PREFIX = "SDJ-1-"
export const MIN_SHELF_TOKEN_LENGTH = 8

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
  return barcode.toUpperCase()
}

export function getShelfLayer(token){
  return parseInt(token.substring(5,7))
}
export function shelfSorter(shelf_a,shelf_b){
  try {
    let shelf_a_tokens = shelf_a.substring(3,7)
    let shelf_b_tokens = shelf_b.substring(3,7)
    let result = parseInt(shelf_a_tokens) - parseInt(shelf_b_tokens)
    return result
  } catch (e) {
    return 1
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
