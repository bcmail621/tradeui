(function () {

    console.log('tradeui::scope::start');

    /**
     * just multiline css string
     * */
    var overrideLiveCoinCss = function () {/*
     <style>
         .ng-scope[ng-controller=PricesCtrl] {
             position: fixed;
             left: 20px;
         }
         .terminal_currency tbody td {
             max-width: 140px;
             width: auto;
             padding: 0 4px !important;
             border-right: 1px solid #C4C7CA;
             text-align:left;
         }
         .terminal_currency tbody td .btACheck {
             position:relative;
             display: inline-block;
             margin: 0 !important;
             height: 10px !important;
             width: 13px !important;
             background-position: 0 !important;
         }
         .terminal_currency tbody td .pairName {
            padding-left: 0 !important;
         }
         .ui_color_red {
            color: #D05655
         }
         .ui_color_green {
            color: #6C9735;
         }
         .ui_color_yellow {
            color: #FFD200;
         }
         .ui_input {
             display:block;
             text-align: center !important;
             width:70px !important;
             height: 24px !important;
             font-family: 'Arial' !important;
             font-size: 10px !important;
             border: 0px !important;
             padding:0 !important;
             margin:0 !important;
         }
         .last_td {
            min-width: 100px !important;
         }
     </style>
     */
    }.toString().match(/<style>[\W\w]*<\/style>/)[0];

    function getColorSpanWrapper(color, text) {
        switch (color) {
            case 0:
                color='ui_color_red'; break;
            case 1:
                color='ui_color_green'; break;
            case 2:
                color='ui_color_yellow'; break;
            default:
                color='';
                break;
        }

        return '<span class="'+color+'">' + text + '</span>';
    }

    function getCommission(value, commission) {
        return ((value / 100) * commission);
    }

    function getDelta(a, b) {
        if (a > b) {
            return (a - b);
        }
        return (b - a);
    }

    function toFixed(coin_name,value) {
        //livecoin rounding
        try {
            var precision = window.btc.currency.getPrecision(coin_name, false);
            if(precision) {
                return window.btc.ceilFloat(value, precision);
            }
        } catch (e) {
            console.error(e);
            return value.toFixed(8);
        }
    }

    function fill_input(e) {
        console.log('fill_input',e);
        e.preventDefault();
        e.stopPropagation();
        var $this = $(this);
        var $tr = $this.parent().parent();
        console.log('fill_input',$this);
        console.log('fill_input',$this.parent().parent());
        $('input', $tr).val($this.text());
        update($tr);
    }

    function main() {
        /**
         * if jquery not loaded yet,
         * we catch error, go out and repeat until it loads jquery
         * (because we use jquery from livecoin)
         * */
        try {

            var $terminal = $('.terminal_currency');

            /** jquery loaded */

            try {

                console.log('tradeui::main');

                clearInterval(interval);

                /** Add our css to livecoin */
                $('body').prepend(overrideLiveCoinCss);

                /** remove table headers (it confuses us),
                 *  because later we add new 3 td to this table */
                $('thead tr:last', $terminal).remove();

                var $tbody_tr = $('tbody tr', $terminal);

                $tbody_tr.each(function (i, tr) {
                    var $tr = $(tr);
                    var $td_with_name = $('td:eq(0)', $tr);
                    var $td_myprice = $('td:eq(2)', $tr);
                    var coin_pair_name = $td_with_name.text().trim(); // ETH/BTC

                    $tr.append($('<td></td><td class="last_td"></td>'));

                    if (coins[coin_pair_name]) {
                        $tr.prepend($('<td><input type="text" class="ui_input" value="'+coins[coin_pair_name].buy_amount+'"/></td>'));
                        $td_myprice.on("DOMSubtreeModified.tradeui", function() {
                            update($(this).parent());
                        });
                    } else {
                        $tr.prepend($('<td><input type="text" class="ui_input"/></td>'));
                    }

                    update($tr,true);
                });

                /**
                 * td in tables have inline css. set to auto. then we can apply our css  */
                var $terminal_tbody_td = $('tbody td', $terminal);
                $terminal_tbody_td.css('width', 'auto');

                /** if we click on our input,
                 *  livecoin makes f5 (shows us traderoom for currency on row where this is input)
                 *  Disable it */
                $('input', $terminal)
                    .on('click.tradeui', function (e) {
                        e.preventDefault();
                        return false;
                    })
                    .on('input.tradeui',function () {
                        update($(this).parent().parent())
                    })
                ;

                $($tbody_tr).on('click.tradeui','.tradeui_fillinput', fill_input);

                /** autoclick on favorites */
                //$('.favBtFBtn', $terminal).trigger('click');

                /** autoclick show all */
                //$('.pricesTab', $terminal).trigger('click');

                console.log('tradeui::main::end');
            } catch (e) {
                console.error('tradeui::main exception', e);
                alert('Unknown exception. see console');
            }

        } catch (e) {
            return false;
        }

    }

    function update($tr, skip_log) {
        try {

            !skip_log ? console.log('tradeui::update', $tr[0]) : null;

            /** get table cells and needed values */
            var $sell_count_input = $('td:eq(0) input', $tr);
            var $td_with_name = $('td:eq(1)', $tr);
            var $td_myprice = $('td:eq(2)', $tr);
            var $td_price = $('td:eq(3)', $tr);
            var $td_full_coins_price = $('td:eq(5)', $tr);
            var $td_count_coins_price = $('td:eq(6)', $tr);

            var coin_pair_name = $td_with_name.text().trim(); // ETH/BTC
            var coin_name = coin_pair_name.match('(.*)/'); // ETH

            var current_price = parseFloat($td_price.text().trim().replace(/[aA-zZ\s]+/i, ''));

            if (coins[coin_pair_name]) {

                var full_buy_myprice = (coins[coin_pair_name].buy_amount * coins[coin_pair_name].buy_price);
                var full_buy_myprice_with_comission = full_buy_myprice + getCommission(full_buy_myprice, commission);

                var full_sell_price = (coins[coin_pair_name].buy_amount * current_price);
                var full_sell_price_without_comission = full_sell_price - getCommission(full_sell_price, commission);

                var color_delta_green_or_red = (full_sell_price_without_comission > full_buy_myprice_with_comission) ? 1 : 0;
                var color_yellow_less_than_the_minimum_bid = (full_sell_price_without_comission < min_rate) ? 2 : null;

                $td_full_coins_price.html(
                    'amount: <span class="tradeui_fillinput">' + coins[coin_pair_name].buy_amount + '</span>'
                    + '<br>'
                    + '<span title="Price for `all volume` i buyed with trade commission">'
                    + toFixed(
                        coin_name,
                        full_buy_myprice_with_comission
                    )
                    + '</span>'
                    + '<br>'
                    + getColorSpanWrapper(
                        color_delta_green_or_red,
                        toFixed(coin_name,getDelta(full_buy_myprice_with_comission, full_sell_price_without_comission))
                    )
                    + '<br>'
                    + '<span title="Price per sale `all volume` with `current price` minus trade commission">'
                    + getColorSpanWrapper(
                        color_yellow_less_than_the_minimum_bid,
                        toFixed(coin_name,full_sell_price_without_comission)
                    )
                    + ' (sell)'
                    + '</span>'
                );

                var input_sell_amount = $sell_count_input.val().trim();
                var input_sell_price;

                if (!input_sell_amount) {
                    input_sell_amount = 0;
                    input_sell_price = 0;
                } else {
                    input_sell_amount = parseFloat(input_sell_amount);
                    input_sell_price = (input_sell_amount * current_price);
                }

                var input_sell_price_with_commission = input_sell_price + getCommission(input_sell_price, commission);
                var input_sell_price_without_commission = input_sell_price - getCommission(input_sell_price, commission);

                color_yellow_less_than_the_minimum_bid = null;
                if(input_sell_price_without_commission < min_rate || input_sell_amount > coins[coin_pair_name].buy_amount) {
                    color_yellow_less_than_the_minimum_bid = 2
                }

                if (input_sell_price_without_commission > full_buy_myprice_with_comission) {
                    color_delta_green_or_red = 1;
                } else {
                    color_delta_green_or_red = 0;
                }

                $td_count_coins_price.html(
                    'count: ' + input_sell_amount
                    + '<br><span title="Price per buy `input amount` with `current price` plus trade commission">'
                    + toFixed(coin_name,input_sell_price_with_commission) + ' (buy)'
                    + '</span><br>'
                    + getColorSpanWrapper(
                        color_delta_green_or_red,
                        toFixed(coin_name,getDelta(input_sell_price_without_commission, full_buy_myprice_with_comission))
                    )
                    + '<br><span title="Price per sale `input amount` with `current price` minus trade commission">'
                    + getColorSpanWrapper(
                        color_yellow_less_than_the_minimum_bid,
                        toFixed(coin_name,input_sell_price_without_commission)
                    )
                    + ' (sell)'
                    + '</span>'
                );

                if (current_price > coins[coin_pair_name].buy_price) {
                    color_delta_green_or_red = 1;
                    $td_with_name.css('background-color', '#6C9735').css('color', 'white');
                } else {
                    color_delta_green_or_red = 0;
                    $td_with_name.css('background-color', '#D05655').css('color', 'white');
                }

                $td_myprice.html(
                    coins[coin_pair_name].buy_price + '<br>'
                    + getColorSpanWrapper(
                        color_delta_green_or_red,
                        toFixed(coin_name,getDelta(current_price, coins[coin_pair_name].buy_price))
                    )
                );
            }

            !skip_log ? console.log('tradeui::update::end') : null;
        } catch (e) {
            console.error('tradeui::update::exception', e);
            $('.terminal_currency tbody tr td').unbind('DOMSubtreeModified.tradeui');
            $('.terminal_currency tbody tr td input').unbind('click.tradeui').unbind('input.tradeui');
            $('.terminal_currency tbody tr td span').unbind('click.tradeui');
            alert('unknown exception. see console');
        }
    }

    var min_rate = 0.0001;
    var commission = 0.18;
    var coins = {
        "ETH/BTC": {
            buy_amount: 10,
            buy_price: 0.08297122
        }, 
    };

    var interval = setInterval(main, 1000);

    console.log('tradeui::scope::end');
})();

