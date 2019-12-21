#!/usr/bin/env node

const program = require('commander');

const bootstrap = require('./bootstrap')

const main = async () => {
	console.log('Connecting please wait....')
	
	await bootstrap()

	program
		.option('-i, --import-transaction <file>', 'Import amazon seller transaction csv file')
		.option('-a, --import-asins <file>', 'Import amazon seller transaction csv file')
		.option('-o, --import-orders', 'Import amazon seller orders')
		.option('-s, --generate-order-summary', 'Generate Order Summary')
		.parse(process.argv);


	if(program.generateOrderSummary) {
		// console.log(program.importTransaction)
		const OrderSummary = require('./src/fn/OrderSummary') 
		const result = await OrderSummary()
		// console.log(result)
	}
	
	if(program.importOrders) {
		// console.log(program.importTransaction)
		const OrderImport = require('./src/fn/OrderImport')
		const result = await OrderImport()
		console.log(result)
	}

	
	if(program.importTransaction) {
		// console.log(program.importTransaction)
		const TransactionCsvImport = require('./src/fn/TransactionCsvImport')
		const result = await TransactionCsvImport(program.importTransaction)
		console.log(result)
	}

	if(program.importAsins) {
		// console.log(program.importTransaction)
		const AsinCsvImport = require('./src/fn/AsinCsvImport')
		const result = await AsinCsvImport(program.importAsins)
		// console.log(result)
	}

	process.exit()
}

main()

