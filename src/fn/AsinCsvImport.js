module.exports = async (filePath) => {
    const csv=require('csvtojson')
    const ProductFetch = require('./ProductFetch')

    const jsonObj = await csv().fromFile(filePath)
    const Util = require('../lib/Util')

    // const itemFetched = await ProductFetch('B07MVFW6LV')
    // console.log(itemFetched)
    // return

    
    for(let item of jsonObj) {   
       
        // updat only costs
        // item.cost = parseFloat(item.cost)
        // console.log(item.cost)
        // const result = await App.db.collection('asins').updateOne(
        //     {asin: item.asin},
        //     {$set: {
        //         cost: item.cost
        //     }}, 
        //     {upsert: true}
        // )


        // IMPORT FULLY
        const products = await ProductFetch(item.asin)
        for (const product of products) {
            product.custom_group = item.custom_group
            product.sku = item.sku

            const result = await App.db.collection('asins').updateOne(
                {asin: product.asin},
                {$set: product}, 
                {upsert: true}
            )

            console.log('Processed: ', item.asin)
            // await Util.delay(2000)
        }
        
    }


    return {
        total: jsonObj.length,
    }
}