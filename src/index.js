const express = require('express')
const MongoClient = require('mongodb').MongoClient;

const app = express()
global.config = require('./config')
global.App = {};

const OrderImport = require('./fn/OrderImport')
const ProductFetch = require('./fn/ProductFetch')
const AsinImport = require('./fn/AsinImport')

app.get('/', (req, res) => res.send('Hello World!'))


app.get('/orders_import', (req, res) => {
    // return res.send('Orders')
    OrderImport().then((result) => {
        console.log('respspssp')
        return res.send(result)
    }).catch((err) => {
        console.log(err)
        return res.send(err)
    })
})

app.get('/product/:asin', (req, res) => {
    // return res.send(req.params.asin)
    ProductFetch(req.params.asin).then((result) => {
        console.log('success')
        return res.send(result)
    }).catch((err) => {
        console.log(err)
        return res.send(err)
    })
})

app.get('/asin_import/:asins', (req, res) => {
    // return res.send(req.params.asin)
    AsinImport(req.params.asins).then((result) => {
        console.log('success')
        return res.send(result)
    }).catch((err) => {
        console.log(err)
        return res.send(err)
    })
})

let main = async () => {
    App.dbConn = await MongoClient.connect(config.db_uri, { 
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    App.db = App.dbConn.db(config.db_name)
    app.listen(config.port, () => console.log(`Example app listening on port ${config.port}!`))

    // OrderImport().then((result) => {
    //     console.log('respspssp')
    //     // return res.send(result)
    // }).catch((err) => {
    //     console.log(err)
    //     // return res.send(err)
    // })
}

main()