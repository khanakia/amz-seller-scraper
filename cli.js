#!/usr/bin/env node

const program = require('commander');

const bootstrap = require('./bootstrap')

const main = async () => {
	console.log('Connecting please wait....')
	
	await bootstrap()

	program
		.option('-i, --import-transaction <file>', 'Import amazon seller transaction csv file')
		.parse(process.argv);

	
	
	if(program.importTransaction) {
		// console.log(program.importTransaction)
		const TransactionCsvImport = require('./src/fn/TransactionCsvImport')
		const result = await TransactionCsvImport(program.importTransaction)
		console.log(result)
	}

	process.exit()
}

main()

