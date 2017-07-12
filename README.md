# tradeui
ui helper for livecoin.net

## overview

We want buy 10 ETH for 0.08297122.

<img src='http://i.imgur.com/gBoo1G8.png'>

Copy our script and paste in console (in google-chrome press ctrl+shift+i)

<img src='http://i.imgur.com/AiwgZP6.png'>

or use ([Custom Javascript for Websites](https://chrome.google.com/webstore/detail/custom-javascript-for-web/poakhlngfciodnhlhhgnaaelnpjljija) for Chrome) 

Press enter. Then we can see:

<img src='http://i.imgur.com/E9XPptj.png'>

yellow color = we cant sell or sell price < MIN_RATE. (`INPUT_AMOUNT`(12) > `BUY_AMOUNT`(10)) or (`(7)` < `MIN_RATE`)

<img src='http://i.imgur.com/I0qBySU.png'>

`TRADE_COMISSION` = 0.18; 

`MIN RATE` = 0.0001;

For names in script config `Volume cell` replaced with:

- `(1)(BUY_PRICE)` - Purchase price for 1 unit
- `(2)` - Delta per one unit we (get\lose) from `BUY_PRICE` price to `CURRENT_PRICE`

(Current price cell)
- `(3)(CURRENT_PRICE)` - Current trade price

(Our amount cell)
- `(4)(BUY_AMOUNT)` - `buy_amount` from config (we buyed 4.  `BUY_AMOUNT`= 4 )

- `(5)` - The real price of the purchase, for which we bought 4 REE ((`BUY_AMOUNT` * `BUY_PRICE`) + `TRADE_COMISSION`)
- `(6)` - Delta per sale (get\loss)  from `(7)` price to `(5)`
- `(7)` - Price per sale for buy_amount  with current_price ((`BUY_AMOUNT` * `(3)`) - `TRADE_COMISSION`)

(Dynamic amount cell)
- `(8)(INPUT_AMOUNT)` - how much we want sell\buy

- `(9)` - `INPUT_AMOUNT`
- `(10)` - just buy stat. if we want buy 2 ((`INPUT_AMOUNT` * `CURRENT_PRICE`) + `TRADE_COMISSION`)
- `(11)` - Delta per sell (get\loss)  from `(12)` price to `(5)`
- `(12)` -  Price for sell  `INPUT_AMOUNT` by `CURRENT_PRICE` ((`INPUT_AMOUNT` * `CURRENT_PRICE` ) - `TRADE_COMISSION`)

#### Use btc address below to donate. Thanks! 
##### 1LDd4XVHoZ6gCbeQ4Ru8xmAskwwMvTpyd4
