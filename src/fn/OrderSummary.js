const Util = require('../lib/Util')


module.exports = async () => {
    const orders = await App.db.collection('sc_orders').find({}).toArray()
    // console.log(orders)

    // console.log(orders)

    for (const order of orders) {
        // console.log(order)
        let orderId = order.amazonOrderId
        const asin = Util.objValue(order, ['orderItems', 0, 'asin'])
        const sku = Util.objValue(order, ['orderItems', 0, 'sellerSku'])
        
        

        const asinItem = await App.db.collection('asins').findOne({asin: asin})
        const cost = Util.objValue(asinItem, ['cost'], 111)
        const item_name = Util.objValue(asinItem, ['item_name'])
        

        const txns = await App.db.collection('sc_txns').aggregate(
            [
                {
                    $match: {
                        orderId: orderId
                    }
                },
                {
                    $group:
                    {
                        _id: null,
                        txn_total: { $sum: "$total" },
                        txn_count: { $sum: 1 }
                    }
                }
            ]
        ).toArray()

        let txn_total = Util.objValue(txns, [0, 'txn_total'], 0)
        txn_total = parseFloat(txn_total.toFixed(2))
        const txn_count = Util.objValue(txns, [0, 'txn_count'])


        let data = {
            orderId,
            asin,
            sku,
            txn_total,
            txn_count,
            cost,
            item_name

        }
        
        // console.log(data)

        await App.db.collection('orders_summary').updateOne(
            {orderId: orderId},
            {$set: data}, 
            {upsert: true}
        )
        // count += 1 
        console.log('Updated Order: ', order.amazonOrderId)

        // resultList.push(order)
    }




}
