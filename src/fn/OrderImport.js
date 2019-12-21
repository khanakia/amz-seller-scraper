const Util = require('../lib/Util')
function getOrderTotal(items) {
    let total = 0;
    for (const item of items) {
        // total += item.unitPrice.Amount
        total += Util.objValue(item, ['unitPrice', 'Amount'], 0)
    }
    return total
}

module.exports = async () => {
    const Order = require('../aws-scrapper/Order')
    let order = new Order({
        cookie: config.sc_cookie
    })
    
    let resultList = []
    let count = 0
    let limit = 100
    for (let index = 0; index < 5139; index += limit) {
        console.log('Fetching Offset: ', index)
        resultList.push(index)
        
        const list = await order.list({
            offset: index,
            fulfillmentType: 'fba',
            // orderStatus: 'canceled',
            limit : limit
        })

     
    
        if(list.error) {
            return {
                message: 'Orders Import ERROR',
                error: list.error
            }
        }
    
        for (const order of list.orders) {
            order.orderDate = new Date(order.orderDate*1000)
            order.cancellationDate = order.cancellationDate ? new Date(order.cancellationDate*1000) : null
            order.earliestDeliveryDate = order.earliestDeliveryDate ? new Date(order.earliestDeliveryDate*1000) : null
            order.earliestShipDate = order.earliestShipDate ? new Date(order.earliestShipDate*1000) : null
            order.latestDeliveryDate = order.latestDeliveryDate ? new Date(order.latestDeliveryDate*1000) : null
            order.latestShipDate = order.latestShipDate ? new Date(order.latestShipDate*1000) : null
            order.total = getOrderTotal(order.orderItems)
            order.fulfillBy = order.isMerchantFulfilled ? 'mfn' : 'fba'
            
            // console.log(order.orderItems)
            for (const orderItem of order.orderItems) {
                orderItem.amazonOrderId = order.amazonOrderId
                orderItem.orderDate = order.orderDate
            }

            
            await App.db.collection('sc_orders').updateOne(
                {amazonOrderId: order.amazonOrderId},
                {$set: order}, 
                {upsert: true}
            )
            count += 1 
            console.log('Updated Order: ', order.amazonOrderId)

            resultList.push(order)
        }

        console.log(count)
        
    }
    
    return {
        message: 'Orders Imported',
        response: resultList
    }
    // App.db.collection('sc_orders')
    // await App.db.collection.updateOne(
    //     {sku: item.sku},
    //     {$set: item}, 
    //     {upsert: true}
    // )
}
