const express = require('express')
const MongoClient = require('mongodb').MongoClient;

const app = express()
global.config = require('./src/config')
global.App = {};

module.exports = async () => {
    App.dbConn = await MongoClient.connect(config.db_uri, { 
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    App.db = App.dbConn.db(config.db_name)
}

