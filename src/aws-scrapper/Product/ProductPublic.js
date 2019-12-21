var fs = require('fs')
var rp = require('request-promise');
const cheerio = require('cheerio')

class ProductPublic {
    extractInt(val) {
        try {
            if (!Boolean(val)) return 0
            return parseInt(val.match(/\d+/)[0])
            
        } catch (error) {
            return 0
        }
    }
    formatString(val) {
        if(!val) return val
        return val.replace(/\r?\n?/g, '').trim()
    }
    async _getHtml(url) {
		var options = {
            method: 'GET',
            url: url
            // uri: 'https://www.amazon.in/dp/'+asin
            // uri: 'http://localhost/aa.htm'
        };
        
		const result = await rp(options)
		return result
    }

    async fetch(asin) {
        try {
            let uri = 'https://www.amazon.in/dp/'+asin
            // uri = 'http://localhost/aa.htm'
            const result = await this._getHtml(uri)
            return result
        } catch (error) {
            console.log(asin + ' Not found. Code:' +error.statusCode)
            return ''
        }
    }

    // async fetchAndParseWithVariations(asin) {
    //     const result = await this.fetch(asin)
    //     const variations = await this.listVariationAsins(result)
    // }

    async parse(result, args={}) {
        // let uri = 'https://www.amazon.in/dp/'+asin
        // // uri = 'http://localhost/aa.htm'

        // const result = await this._getHtml(uri)
        
        try {
            const $ = await cheerio.load(result)
            let product = {}
            
            // if there is no buybox then it means the product is unqualified to win buybox
            if($('#unqualifiedBuyBox').length > 0) {
                product['unqualifiedBuyBox'] = true
                let offers = await this.listOffers(args.asin)
                // console.log(offers)
                let firstOffer = offers[0] || {}
                // console.log(firstOffer.sellerLink)
                
                product['soldBySeller'] = firstOffer.sellerName
                product['soldBySellerLink'] = firstOffer.sellerLink
                product['offersCount'] = offers.length
                product['ourPrice'] =  firstOffer.offerPrice
                product['ourShippingPrice'] =  firstOffer.shippingPrice
                
    
            } else {
                product['unqualifiedBuyBox'] = false
                product['soldBySeller'] = $('#merchant-info a').text()

                let href = $('#merchant-info a').attr('href')
                product['soldBySellerLink'] = undefined!==href ? 'https://www.amazon.in' + href : null
                const _offersCount = $('#olp_feature_div a').text()
                product['offersCount'] = this.extractInt(_offersCount)
                product['ourPrice'] =  this.extractInt($('#priceblock_ourprice').text().trim())
                product['ourShippingPrice'] =  this.extractInt($('#ourprice_shippingmessage > span').text())
                
                
            }
            
            product['ourPriceTotal'] = product['ourPrice'] + product['ourShippingPrice']
            // product['headTitle'] = $('head title').text()
            // product['metaDesc'] = $('meta[name="description"]').attr('content')
            // product['metaKeywords'] = $('meta[name="keywords"]').attr('content')
            product['reviewCount'] = this.extractInt($('#acrCustomerReviewText').text())
            product['categoryId'] = undefined!==$('input#nodeID').val() ? $('input#nodeID').val() : null
    
            let breadcrumb = []
            $('#wayfinding-breadcrumbs_feature_div ul li a').each((i, elem) => {
                breadcrumb.push(this.formatString($(elem).text())) 
            })
            product['breadcrumb'] = breadcrumb
            
            // console.log(product)
            return product
            
        } catch (error) {
            console.log(error)
            return {}
        }
    }
  
    async listOffers(asin) {

        try {
            let uri = 'https://www.amazon.in/gp/offer-listing/'+asin
            // uri = 'http://localhost/offer.html'
            
            const result = await this._getHtml(uri)
            const $ = await cheerio.load(result)
            let offers = []
            // console.log($(".olpOffer").html())
            $(".olpOffer").each((i, offerRow) => {
                // console.log($(offerRow).attr('class'))
                offers.push({
                    offerPrice: this.extractInt($(offerRow).find('.olpOfferPrice > span').text()),
                    shippingPrice: this.extractInt($(offerRow).find('.olpShippingPrice > span').text()),
                    sellerName:  $(offerRow).find('.olpSellerName a').text(),
                    sellerLink:  'https://www.amazon.in' + $('.olpSellerName a').attr('href')
                })
            })
    
            // console.log(offers)
            
            return offers
            
        } catch (error) {
            console.log(error)
            return []
        }
    }


    async listVariationAsins(result) {
        try {
            // let uri = 'https://www.amazon.in/dp/'+asin
            // // uri = 'http://localhost/aa.htm'
            // const result = await this._getHtml(uri)
            const $ = await cheerio.load(result)
            let asinList = []
    
            // GET Parent ASIN
            let stateJson = JSON.parse($('script[type="a-state"][data-a-state="{"key":"page-refresh-data-mason"}"]').html())
            // console.log(stateJson)
            if(!stateJson) return []
            const parentAsin = stateJson.pageRefreshUrlParams.parentAsin
    
            // Get ALL VARIATION ASINS
            $('#twister > div').each((i, elem) => {
                let variationId = ($(elem).attr('id'))
                let variationLabel  = this.formatString($(elem).find('.a-form-label').text())
                $(elem).find('ul li').each((i, li) => {
                    let variationValue  = this.formatString($(li).attr('title').replace('Click to select ', ''))
                    asinList.push({
                        parent: parentAsin,
                        variationId: variationId,
                        variationLabel: variationLabel,
                        variationValue: variationValue,
                        asin: $(li).attr('data-defaultasin'),
                    })
                })
            })
    
            return asinList
            
        } catch (error) {
            console.log(error)
            return []
        }
    }
}

module.exports = ProductPublic


// let _p = new Product()

// const wrappedFn = timeFnPromise(_p._getHtml)

// wrappedFn('https://www.amazon.in/dp/B07M77PSNG').then((res) => {
//     console.log(res)
// })

// B078KQXBQW - Shunkk Wooden Parent 
// B078L1MS5H - Shunkk wooden
// Jeoga Tempered - B07MS8RCPR
// Variations Product - B07H45YVFD
// _p.get('B078KQXBQW').then((res) => {
//     console.log(res)
// })


// _p.listVariationAsins('B078KQXBQW').then((res) => {
//     console.log(res)
// })

// _p.listOffers('B00FNJ8COE').then((res) => {
//     console.log(res)
// })