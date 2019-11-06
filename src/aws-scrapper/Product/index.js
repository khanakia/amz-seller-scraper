const ProductPublic = require('./ProductPublic')
const ProductSc = require('./ProductSc')

class Product {
	constructor(args = {}) {
		this.args = Object.assign({}, {
			cookie: null
		}, args)

	}

	async getByAsin(asin) {
		if (!this.args.cookie) {
			return {
				error: {
					message: 'cookie not defined',
				}
			}
		}
		const productPublic = new ProductPublic()
		const resultHtml = await productPublic.fetch(asin)
		// const parsed = await productPublic.parse(resultHtml)

		const variations = await productPublic.listVariationAsins(resultHtml)

		const productSc = new ProductSc({
			cookie: this.args.cookie
		})

		// const parsedSc = await productSc.get(asin)
		// return parsedSc

		let results = []

		if (variations.length > 0) {
			console.log('multiple variation')
			for (let variation of variations) {
				let vprod = await productPublic.fetch(variation.asin)
				const detail = await productPublic.parse(vprod, { asin })
				const scdetail = await productSc.get(variation.asin)
				results.push({
					...{
						createdAt: new Date(),
						asin,
					},
					...variation,
					...detail,
					...scdetail
				})
			}

		} else {
			console.log('single variation')
			const detail = await productPublic.parse(resultHtml, { asin })
			const scdetail = await productSc.get(asin)
			results.push({
				...{
					createdAt: new Date(),
					asin,
				},
				...detail,
				...scdetail
			})
		}

		return results
	}
}

module.exports = Product