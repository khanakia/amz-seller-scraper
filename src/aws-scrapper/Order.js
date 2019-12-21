var rp = require("request-promise");

class Order {
	constructor(args={}) {
		this.cookie = args.cookie;
	}

    isAO(val) {
        return val instanceof Array || val instanceof Object ? true : false;
    }

	async list(qs={}) {
        qs = Object.assign({}, {
            limit: '100',
            offset: '0',
            sort: 'ship_by_asc',
            'date-range': '1483209000000-1572719399000',
            fulfillmentType: 'mfn',
            orderStatus: 'shipped',
            forceOrdersTableRefreshTrigger: 'false' 
        }, qs)
        
        try {
            var headers = { 
                'cookie' : this.cookie
            }

            if(!headers.cookie) {
                throw new Error('SC Cookie not defined.')
            }

            // return headers
            var options = {
                method: 'GET',
                // uri: `https://sellercentral.amazon.in/orders-api/search?limit=95&offset=5&sort=ship_by_asc&date-range=1493577000000-1572632999000&fulfillmentType=mfn&orderStatus=shipped&forceOrdersTableRefreshTrigger=false`,
                uri: `https://sellercentral.amazon.in/orders-api/search`,
                
                qs: qs,
                headers: headers,
                json: true 
            };
            
            
            const response = await rp(options)
           
            if(!this.isAO(response)) {
                throw new Error(response)
            }
            // try {
            //     JSON.parse(response);
            // } catch (e) {
            //     // return false;
            //     console.log(e)
            //     throw new Error(response)
            // }

            // const result = this.parseInventoryList(response)

            return response
        } catch (error) {
            console.log(error)
            return {
                error: error.toString()
            }
        }
    }
}

module.exports = Order;
