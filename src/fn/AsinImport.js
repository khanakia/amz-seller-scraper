module.exports = async (asins) => {
    const asinList = asins.split(',')

    const Product = require('../aws-scrapper/Product')
    let product = new Product({
        cookie: config.sc_cookie
    })
    
    let result = []
    for(let asin of asinList) {
        const products = await product.getByAsin(asin)

        if(products.error) return products
       
        for (let product of products) {
            App.db.collection('asins').updateOne(
                {asin: product.asin},
                {$set: product}, 
                {upsert: true}
            )

            result.push(product)
        }

        
    }

    return result
}

