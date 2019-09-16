

const SDJ_SHELF_PREFIX = "SDJ-1-"

export function normalize_shelf_barcode(barcode){
  let tokens =[]
  if(barcode.includes('-')){
    if(barcode.includes(SDJ_SHELF_PREFIX)){
      barcode = barcode.replace(SDJ_SHELF_PREFIX,"")
      tokens = barcode.split('-').filter(e=>e)
      if(tokens[0].length == 1){
        tokens[0] = `0${tokens[0]}`
      }
      if(tokens[1] && tokens[1].length == 1){
        tokens[1] = `0${tokens[1]}`
      }
    }else{
      barcode = barcode.replace(/-/g,'')
    }
  }

  console.log(barcode)
  tokens[0] = barcode.substring(0,2)
  tokens[1] = barcode.substring(2,4)
  tokens[2] = barcode.substring(4,5)
  tokens[3] = barcode.substring(5,6)
  return tokens.filter(t=>t).join('-').toUpperCase()

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
