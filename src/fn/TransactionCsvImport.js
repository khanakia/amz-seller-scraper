// remove commas from amount it was saving for eg. 7,472 as 7 only
// https://www.geeksforgeeks.org/how-to-convert-a-currency-string-to-a-double-value-with-jquery-or-javascript/
function convert(currency){ 
    // Using replace() method 
    // to make currency string suitable  
    // for parseFloat() to convert  
    var temp = currency.replace(/[^0-9.-]+/g,""); 
        
    // Converting string to float 
    // or double and return 
    return parseFloat(temp); 
    
} 

module.exports = async (filePath) => {
    const csv=require('csvtojson')
    const md5=require('md5')
    const uuidv4 = require('uuid/v4');


    const jsonObj = await csv({
        headers: [
            'createdAt',
            'settlementId',
            'type',
            'orderId',
            'sku',
            'description',
            'quantity',
            'marketplace',
            'fulfillment',
            'orderCity',
            'orderState',
            'orderPostal',
            'productSales',
            'shippingCredits',
            'promotionalRebates',
            'gstBeforeTcs',
            'tcsCgst',
            'tcsSgst',
            'tcsIgst',
            'sellingFees',
            'fbaFees',
            'otherTransactionFees',
            'other',
            'total'
          ]
    }).fromFile(filePath)

    
    const uuid = uuidv4();

    let matched = 0
    let matchedItems = []
    let matchedRows = []
    let count = 0
    for(let item of jsonObj) {   
        
        item.group = 'cod'

        let type = item.type
        item.type = type.replace(/(\r\n|\n|\r)/gm,"")


        item.createdAt = new Date(item.createdAt)
        item.md5Key = md5(item.createdAt+ ':'+ item.sku+ ':'+ item.orderId + ':'+ item.total)
        item.uuid = uuid
        item.fbaFees = convert(item.fbaFees)
        item.gstBeforeTcs = convert(item.gstBeforeTcs)
        item.other = convert(item.other)
        item.otherTransactionFees = convert(item.otherTransactionFees)
        item.productSales = convert(item.productSales)
        item.quantity = item.quantity ? parseInt(item.quantity) : 0
        item.shippingCredits = convert(item.shippingCredits)
        item.tcsCgst = convert(item.tcsCgst)
        item.sellingFees = convert(item.sellingFees)
        item.tcsIgst = convert(item.tcsIgst)
        item.tcsSgst = convert(item.tcsSgst)
        item.total = convert(item.total)


        const result = await App.db.collection('sc_txns').updateOne(
            {uid: item.md5Key},
            {$set: item}, 
            {upsert: true}
        )

        // console.log(result)

        matched += result['matchedCount']

        if(result['matchedCount']==1) {
            console.log('match Found', item.orderId)
            matchedItems.push(item)
            matchedRows.push(count)
        }

        count += 1
        // console.log(result['matchedCount'])
        // await App.db.collection('sc_txns').insertOne(item)
        console.log('Created: ', item.orderId)

        
    }

    // return result

    // return jsonObj  
    return {
        total: jsonObj.length,
        matched: matched,
        inserted: jsonObj.length-matched,
        matchedRows: matchedRows,
        matchedItems: matchedItems
    }
}