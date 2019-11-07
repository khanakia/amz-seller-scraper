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
            'Sku',
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
    for(let item of jsonObj) {   
       
        item.createdAt = new Date(item.createdAt)
        item.md5Key = md5(item.createdAt+ ':'+ item.orderId + ':'+ item.total)
        item.uuid = uuid

        const result = await App.db.collection('sc_txns').updateOne(
            {uid: item.md5Key},
            {$set: item}, 
            {upsert: true}
        )

        matched += result['matchedCount']

        if(result['matchedCount']==1) {
            console.log('match Found', item.orderId)
        }
        // console.log(result['matchedCount'])
        // await App.db.collection('sc_txns').insertOne(item)
        console.log('Created: ', item.orderId)
    }

    // return result

    // return jsonObj  
    return {
        total: jsonObj.length,
        matched: matched,
        inserted: jsonObj.length-matched
    }
}