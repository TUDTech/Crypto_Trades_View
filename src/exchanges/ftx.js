import Exchange from '../services/exchange'

class Ftx extends Exchange {
  constructor(options) {
    super(options)

    this.id = 'ftx'

    this.endpoints = {
      PRODUCTS: 'https://ftx.com/api/markets'
    }

    this.matchPairName = pair => {
      let id = this.products[pair]

      if (!id) {
        for (let name in this.products) {
          if (pair === this.products[name]) {
            id = this.products[name]
            break
          }
        }
      }

      /*if (id) {
        if (/\d+$/.test(id)) {
          this.types[id] = 'futures';
        } else if (/\-SWAP$/.test(id)) {
          this.types[id] = 'swap';
        } else {
          this.types[id] = 'spot';
        }
      }*/

      return id || false
    }

    this.options = Object.assign(
      {
        url: () => {
          return `wss://ftx.com/ws/`
        }
      },
      this.options
    )
  }

  connect() {
    if (!super.connect()) return

    this.api = new WebSocket(this.getUrl())

    this.api.onmessage = event => this.emitTrades(this.formatLiveTrades(JSON.parse(event.data)))

    this.api.onopen = event => {
      this.skip = true

      for (let pair of this.pairs) {
        this.api.send(JSON.stringify({ op: 'subscribe', channel: 'trades', market: pair }))
      }

      this.keepalive = setInterval(() => {
        this.api.send(
          JSON.stringify({
            op: 'ping'
          })
        )
      }, 15000)

      this.emitOpen(event)
    }

    this.api.onclose = event => {
      this.emitClose(event)

      clearInterval(this.keepalive)
    }

    this.api.onerror = this.emitError.bind(this, { message: 'Websocket error' })
  }

  disconnect() {
    if (!super.disconnect()) return

    if (this.api && this.api.readyState < 2) {
      this.api.close()
    }
  }

  formatLiveTrades(json) {
    if (!json || !json.data || !json.data.length) {
      return
    }

    return json.data.map(trade => {
      const output = [
        this.id,
        +new Date(trade.time),
        +trade.price,
        trade.size,
        trade.side === 'buy' ? 1 : 0
      ]

      if (trade.liquidation) {
        output[5] = 1
      }

      return output
    })
  }

  formatProducts(data) {
    return data.result.reduce((obj, product) => {
      let standardName = product.name
        .replace('/', 'SPOT')
        .replace(/\-PERP$/g, '-USD')
        .replace(/[/-]/g, '')

      obj[standardName] = product.name

      return obj
    }, {})
  }
}

export default Ftx
