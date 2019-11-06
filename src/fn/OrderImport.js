module.exports = async () => {
    const Order = require('../aws-scrapper/Order')
    let order = new Order({
        cookie: config.sc_cookie11
    })
    
    let resultList = []
    let count = 0
    for (let index = 0; index < 143;) {
        console.log('Fetching Offset: ', index)
        resultList.push(index)
        
        const list = await order.list({
            offset: index,
            fulfillmentType: 'fba',
            orderStatus: 'canceled'
        })
    
        if(list.error) {
            return {
                message: 'Orders Import ERROR',
                error: list.error
            }
        }
    
        for (const order of list.orders) {
            await App.db.collection('sc_orders').updateOne(
                {sku: order.amazonOrderId},
                {$set: order}, 
                {upsert: true}
            )
            count += 1 
            console.log('Updated Order: ', order.amazonOrderId)
        }

        resultList.push(list.orders)

        index += 100
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
