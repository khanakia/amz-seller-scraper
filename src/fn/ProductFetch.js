module.exports = async (asin) => {
    const Product = require('../aws-scrapper/Product')
    let product = new Product({
        // cookie: config.sc_cookie
    })

    const result = await product.getByAsin(asin)
    return result   
}


// if(args.dbsave) {
//     for (let result of results) {
//         Sapp.db.collection('asins').updateOne(
//             {asin: result.asin},
//             {$set: result}, 
//             {upsert: true}
//         )
//     }
// }