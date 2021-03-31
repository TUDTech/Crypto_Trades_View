import Exchange from '../services/exchange'
import pako from 'pako'

class Huobi extends Exchange {
  constructor(options) {
    super(options)

    this.id = 'huobi'
    this.types = []
    this.contractTypesAliases = {
      this_week: 'CW',
      next_week: 'NW',
      quarter: 'CQ'
    }

    this.endpoints = {
      PRODUCTS: [
        'http://api.huobi.pro/v1/common/symbols',
        'https://api.hbdm.com/api/v1/contract_contract_info'
      ]
    }

    // 2019-12-13
    // retro compatibility for client without contract specification stored
    // -> force refresh of stored instruments / specs
    if (this.products && typeof this.specs === 'undefined') {
      delete this.products
    }

    this.matchPairName = pair => {
      let id = this.products[pair] || this.products[pair.replace(/USD$/, 'USDT')]

      if (!id) {
        for (let name in this.products) {
          if (pair === this.products[name]) {
            id = this.products[name]
            break
          }
        }
      }

      if (id) {
        if (id.indexOf('_') !== -1) {
          this.types[id] = 'futures'
        } else {
          this.types[id] = 'spot'
        }
      }

      return id || false
    }

    this.options = Object.assign(
      {
        url: pair => {
          if (this.types[pair] === 'futures') {
            return 'wss://www.hbdm.com/ws'
          } else {
            return 'wss://api.huobi.pro/ws'
          }
        }
      },
      this.options
    )
  }

  connect() {
    if (!super.connect()) return

    this.api = new WebSocket(this.getUrl(this.pair))

    this.api.binaryType = 'arraybuffer'

    this.api.onmessage = event => this.emitTrades(this.formatLiveTrades(event.data))

    this.api.onopen = event => {
      for (let pair of this.pairs) {
        this.api.send(
          JSON.stringify({
            sub:
              'market.' +
              (this.types[pair] === 'futures' ? pair.toUpperCase() : pair.toLowerCase()) +
              '.trade.detail',
            id: pair
          })
        )
      }

      this.emitOpen(event)
    }

    this.api.onclose = this.emitClose.bind(this)

    this.api.onerror = this.emitError.bind(this, { message: 'Websocket error' })
  }

  disconnect() {
    if (!super.disconnect()) return

    if (this.api && this.api.readyState < 2) {
      this.api.close()
    }
  }

  formatLiveTrades(event) {
    const json = JSON.parse(pako.inflate(event, { to: 'string' }))

    if (!json) {
      return
    }

    if (json.ping) {
      this.api.send(JSON.stringify({ pong: json.ping }))
      return
    } else if (json.tick && json.tick.data && json.tick.data.length) {
      const pair = json.ch.replace(/market.(.*).trade.detail/, '$1')

      return json.tick.data.map(trade => {
        let amount = +trade.amount

        if (typeof this.specs[pair] !== 'undefined') {
          amount = (amount * this.specs[pair]) / trade.price
        }

        return [this.id, trade.ts, +trade.price, amount, trade.direction === 'buy' ? 1 : 0]
      })
    }
  }

  formatProducts(response) {
    const products = {}
    const specs = {}

    const types = ['spot', 'futures']

    response.forEach((_data, index) => {
      _data.data.forEach(product => {
        let pair

        switch (types[index]) {
          case 'spot':
            pair = (product['base-currency'] + product['quote-currency']).toUpperCase()
            products[pair] = pair
            break
          case 'futures':
            pair = product.symbol + '_' + this.contractTypesAliases[product.contract_type]
            products[product.symbol + 'USD' + '-' + product.contract_type.toUpperCase()] = pair
            products[product.contract_code] = pair
            specs[pair] = +product.contract_size
            break
        }
      })
    })

    return {
      products,
      specs
    }
  }
}

export default Huobi
