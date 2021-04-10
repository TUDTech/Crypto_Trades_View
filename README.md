# SignificantTrades

Live cryptocurrency trades visualizer.

Currently supporting BitMEX, Bitfinex, Binance, Gdax, Bitstamp, Deribit, Huobi, Okex, Hitbtc, Poloniex, Coinex and Liquid.

![Screen Shot 2021-04-10 at 16 50 12](https://user-images.githubusercontent.com/81108192/114276035-d5b36e00-9a1c-11eb-8d41-3b7c386870f7.png)

## What it do

- Show LIVE trades from exchanges on a specific pair (default BTCUSD)
- Filter noise by aggregating trades with the same timestamp
- Chart averaged price, buy & sell volume, price sma, volume ema
- Play audio when trade show up based on volume
- Visualize historical data (when available)

## How it works

The app is written in vue.js, use the javascript WebSocket interface to connect to the exchanges API directly and listen to the trades events. From there it dispatch the trades to difference components within the app :
- The trade list that shows the N previous significant orders
- The chart that shows the averaged price action over the different exchanges
- The counters that sum up buy & sell volume by interval (buy/sell last 15m, last 1h, 2h etc)
- The stats component that show basic number about whats happened under one specific interval (default 1m)

## Demo 

[BTCUSD](https://btcusd.aggr.trade/)<br>
[ETHUSD](https://ethusd.aggr.trade/) (down)<br>
[XLMBTC](https://xlmbtc.aggr.trade/) (down)<br>
Just replace the subdomain by the pair of your choice.<br>
Each subdomain get their own settings.

## How to install & run locally

1. Clone the repo

```bash
git clone https://github.com/TUDTech/Crypto_Trades_View
```

2. Install dependencies

```bash
npm install
```

3. Run dev mode

Dev mode is
```bash
npm run dev
```
This will automatically open a browser window at localhost:8080

Otherwise can build the application
```bash
npm run build
```
and access the index.html directly in the browser later without having to run a command

## Settings

|Name|Description|
|----|:-----------|
|Pair|The pair you want to track. BTCUSD by default| 
|Max rows|Define the maximum lines shown in the trade list| 
|Decimal precision|To override the default rounding behavior (might be useful for alts)| 
|Thresholds|First line define the minimum amount that a trade must have to be shown in the trade list<br>Second line is the significant threshold and define the minimum amount for a trade to be highlighted<br>Third threshold is used to identify rare trades and ask you a keyword for the kind of it will show on that trade<br>Fourth is same as third one except you can choose another gif keyword :-)|
|Audio|Will play audio (bip bip) when big orders are made<br>It use the significant as a reference to play sound loud or not|
|Stats|Toggle stats component<br>The text field let you choose the stats interval (ex: 60s)|
|Counters|Toggle counters component<br>The texxt field let you define the counters intervals, separed by a comma (ex: 60s, 5m, 30m etc...)|
|Chart|Toggle chart|
|Margin|Add margin on the right of the chart, after printed candle (% of the visible range)|
|Candlestick|Toggle candlestick chart (enabled by default)<br>Show line otherwise|
|Liquidations|Toggle liquidation serie (will add a purple bar serie on top of the buy & sell area series)|
|Volume averages|Toggle EMA on buys & sells<br>The number is the average length (default 14)|
|Exchanges|List the available exchanges<br>Will be grey if the exchange doesn't match current pair<br>Red if error<br>Green if currently connected<br>Name will be striked when disabled. Click on it to enable exchange|
|Exchange visibility|Eye symbol indicate visibility of the exchange. A connected exchange can be hidden temporarily while still capturing trades that can be shown later on|
|Exchange threshold|Use the slider to ajust exchange threshold relative to the main threshold set above|
|Exchange OHLC|Include exchange in chart (enabled by default for most of the exchanges)<br>Include exchange with the most relevant price action|

## Supported pairs

The app fetch the available exchanges products when it starts the first time. So technically every pairs of the supported exchanges are supported. Just type the name in the "pair" settings (without any spaces or caret !).

## Adblocker issue (and solution)

Some adblocker restrict access to exchanges websocket feeds.
uBlock origin block many thing including huobi websocket API.
**Just disable Adblock on the app and you should be alright.**

## Cross-Domain (CORS) policy issue (and solution)

In order to fetch the products the app need to make calls to the exchanges API. Most of thoses API tell the browser they only allow access from the exchange domain. The only way to bypass this is to use a server that will make the call for us. The cors proxy settings let u set the url of this server, which is set to mine by default.
**Running `PROXY_URL=http://my-personnal-cors-proxy.me/ npm run dev` will start the app with another cors proxy which I encourage you to do.**

## About the historical data

I use my servers (api.aggr.trade) to store and serve historical trades on demand.
Let's say you have a server instance running on port 3000, start the client with an environment variable `API_URL=http://localhost:3000/historical/{from}/{to}/{timeframe} npm run dev`.

## Contributing

Thanks all for your contributions...
    
![Screen Shot 2021-03-21 at 19 11 59](https://user-images.githubusercontent.com/81108192/111917690-519f4380-8a79-11eb-9d01-de457b1655f6.png)
    
ETH WALLET: 0xA1134858c168568CBE37649D16723eC8F782e0A2

![Screen Shot 2021-03-21 at 21 56 54](https://user-images.githubusercontent.com/81108192/111922186-5b807100-8a90-11eb-8504-a3fc3ae35052.png)

BTC WALLET: 3N928MmFq51kbf6fE3fxJbtggBhcjMAhSQ
