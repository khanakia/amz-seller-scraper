var rp= require('request-promise');
const cheerio = require('cheerio')

class Inventory {
    constructor(cookie) {
        
        // 'https://sellercentral.amazon.in/productsearch?q=B07GD41HGQ&ref_=xx_prodsrch_cont_prodsrch_ssr_ps_A10KIP72DP1LOF'
        // This is the url you can get from seller central item edit page SELL Yours
        // this.reconcielUri = (asin) => {
        //    return  `https://sellercentral.amazon.in/inventory/belowTheFold?viewId=FBA`
        // }

        this.cookie = cookie
    }

    extractInt(val) {
        if (!val) return 0
        return parseInt(val.match(/\d+/)[0])
    }

    async listBelowTheFold() {
        try {
            var headers = { 
                'cookie' : this.cookie
            }
            var options = {
                method: 'POST',
                uri: `https://sellercentral.amazon.in/inventory/belowTheFold?viewId=FBA`,
                // uri: 'https://sellercentral.amazon.in/inventory/refresh?viewId=FBA',
                body: {"action":"CUSTOM_REFRESH","pageNumber":1,"recordsPerPage":25,"sortedColumnId":"date","sortOrder":"DESCENDING","searchText":"","tableId":"myitable","filters":[{"filterGroupId":"LISTINGS_VIEW","filterCriteria":[{"value":"true","filterId":"Catalog"}]},{"filterGroupId":"FULFILLMENT","filterCriteria":[{"value":"true","filterId":"AllChannels"}]}],"clientState":{"customActionType":"belowTheFold"}},
                headers: headers,
                json: true 
            };
            
            
            const response = await rp(options)
            
            const result = this.parseInventoryList(response)

            return result
        } catch (error) {
            console.log(error.response.statusCode)
            return {}
        }
    }

    async _list(page, belowFold=false) {
        try {
            // let uri = 'https://sellercentral.amazon.in/inventory/belowTheFold?viewId=FBA'
            // if(aboveFold) uri = 'https://sellercentral.amazon.in/inventory/refresh?viewId=FBA'
            let uri = 'https://sellercentral.amazon.in/inventory/refresh?viewId=FBA'

            let body = {"action":"PAGE_CHANGED","pageNumber": page,"recordsPerPage":50,"pageToken":null,"sortedColumnId":"date","sortOrder":"DESCENDING","searchText":"","tableId":"myitable","filters":[{"filterGroupId":"LISTINGS_VIEW","filterCriteria":[{"value":"true","filterId":"Catalog"}]},{"filterGroupId":"FULFILLMENT","filterCriteria":[{"value":"true","filterId":"AllChannels"}]}],"clientState":{}}
            if(belowFold) {
                body['action'] = 'CUSTOM_REFRESH'
                body['clientState']['customActionType'] = 'belowTheFold'
            }

            var headers = { 
                'cookie' : this.cookie
            }
            var options = {
                method: 'POST',
                // uri: `https://sellercentral.amazon.in/inventory/belowTheFold?viewId=FBA`,
                uri: uri,
                body: body,
                headers: headers,
                json: true 
            };
            
            
            const response = await rp(options)
            
            const result = this.parseInventoryList(response)

            return result
        } catch (error) {
            console.log(error.response.statusCode)
            return {}
        }
    }

    async list(page) {
        const belowFoldList = await this._list(page, true)
        // return belowFoldList
        const aboveFoldList = await this._list(page)
        // return aboveFoldList
        return [...aboveFoldList, ...belowFoldList]
        
        // const pg = await this.getPaginationData()
        // // return pg

        // let list = []
        // for (var index = 1; index <= pg.totalpages; index++) {
        //     console.log(index)
        //     const belowFoldList = await this._list(1, true)
        //     // return belowFoldList
        //     const aboveFoldList = await this._list(1)
        //     // return aboveFoldList
        //     list = [...list, ...belowFoldList, ...aboveFoldList]
        // }
        
        // return list
    }

    async getPaginationData() {
        try {
            var headers = { 
                'cookie' : this.cookie
            }
            var options = {
                method: 'GET',
                uri: 'https://sellercentral.amazon.in/inventory/',
                headers: headers,
                json: false
            };        
            const response = await rp(options)
            
            const $ = await cheerio.load(response)
            const totalRecords = this.extractInt($("#mt-header-count-value").text())
            const totalpages = this.extractInt($("input.mt-num-page").val())


            return {
                totalRecords,
                totalpages
            }
        } catch (error) {
            console.log(error.response.statusCode)
            return {}
        }
    }



    async parseInventoryList(result) {
        try {
            
            const $ = await cheerio.load(result)

            let root = $('<div class="root"></div>')
            let table = $('<table class="red-fruit"></table>')

            const recordsHtml = $("#itemRecords > script").html()
            // console.log((recordsHtml))
            table.append(recordsHtml)

            root.append(table)
            // console.log(root.html())
            // return $.html()

            // const totalRecords = this.extractInt($("#totalRecordCount").text())

            let itemList = []
            table.children('tr').each((i, tr) => {
                try {
                    const ddata = JSON.parse($(tr).attr('data-delayed-dependency-data'))
                    const rowdata = JSON.parse($(tr).attr('data-row-data'))
                    itemList.push({...ddata, ...rowdata})
                } catch (error) {
                    // console.log(error)
                }
            })

            return itemList
            
        } catch (error) {
            console.log(error)
            return []
        }
        
    }

}

module.exports = Inventory