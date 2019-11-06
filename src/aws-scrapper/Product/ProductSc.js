var rp = require('request-promise');

class ProductSc {
	constructor(args = {}) {

		// 'https://sellercentral.amazon.in/productsearch?q=B07GD41HGQ&ref_=xx_prodsrch_cont_prodsrch_ssr_ps_A10KIP72DP1LOF'
		// This is the url you can get from seller central item edit page SELL Yours
		this.reconcielUri = (asin) => {
			return `https://sellercentral.amazon.in/abis/ajax/reconciledDetailsV2?asin=${asin}&marketplaceId=A21TJRUUN4KGV`
		}

		this.cookie = args.cookie
	}

	async get(asin) {
		try {
			var headers = {
				'cookie': this.cookie
			}

			if (!headers.cookie) {
				return {
					error: {
						message: 'Header cookie not defied'
					}
				}
			}

			var options = {
				method: 'GET',
				uri: this.reconcielUri(asin),
				// body: atts,
				headers: headers,
				json: true
			};


			const response = await rp(options)
			const result = this.parseReconciledDetails(response)
			return result
		} catch (error) {
			console.log(error)
			return {
				error: {
					message: 'Server error.',
					detail: error.toString()
				}
			}
		}
	}

	async parseReconciledDetails(data) {
		let objOriginal = data['detailPageListingResponse']
		let result = {}
		Object.keys(objOriginal).forEach(function (key) {
			let att = objOriginal[key];
			result[key] = att['value']

		});

		return result
	}

}

module.exports = ProductSc