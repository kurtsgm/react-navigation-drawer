

const SDJ_SHELF_PREFIX = "SDJ-1-"

export function normalize_shelf_barcode(barcode){
  let tokens =[]
  if(barcode.includes('-')){
    if(barcode.includes(SDJ_SHELF_PREFIX)){
      barcode = barcode.replace(SDJ_SHELF_PREFIX,"")
    }
    tokens = barcode.split('-').filter(e=> {
      return e
    }).map(e=> e.replace(/\D/g,''))
    if(tokens[0].length == 1){
      tokens[0] = `00${tokens[0]}`
    }else if(tokens[0].length == 2){
      tokens[0] = `0${tokens[0]}`
    }
  
    barcode = tokens.join('')
  }

  tokens[0] = barcode.substring(0,3)
  tokens[1] = barcode.substring(3,5)
  tokens[2] = barcode.substring(5,6)
  if(barcode.length>6){
    tokens[3] = barcode.substring(6,7)
  }
  return tokens.filter(t=>t).join('-').toUpperCase()
}

export function getShelfLayer(token){
  tokens = token.split('-').filter(e=>e)
  return parseInt(tokens[2])
}
export function shelfSorter(shelf_a,shelf_b){
  try {
    let shelf_a_tokens = shelf_a.split('-')
    let shelf_b_tokens = shelf_b.split('-')
    let result = parseInt(`${shelf_a_tokens[0]}${shelf_a_tokens[1]}`) - parseInt(`${shelf_b_tokens[0]}${shelf_b_tokens[1]}`)
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
