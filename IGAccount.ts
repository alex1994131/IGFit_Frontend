//import yahooFinance from 'yahoo-finance';

import {tickers_offline, prices_offline} from './pricesoffline.js'
//import fetch from "node-fetch"

export var tickers = {};
export var prices = {};
export var tickers_dates = {};
var done = 0;

interface Transaction {
    Date : Date,
    Currency : string,
    Market : string,
    Direction : string,
    Quantity : string,
    Consideration: string,
    Commission: string,
    Charges: string,
    ContractSize?: string,
    Epic?: string,
    "Cost/Proceeds"?: string,
    Price?: string
}

interface TransactionCFD {
    Epic: string,
    DealId: string,
    ActivityHistoryId: string,
    Date: string,
    Time: string,
    ActivityType: string,
    MarketName: any,
    Period: string,
    Result: string,
    Channel: string,
    Currency: string,
    Size: string,
    Level: string,
    Stop: string,
    StopType: string,
    Limit: string,
    ActionStatus: string,
    "Order Stop Level": string,
}

interface TransactionISA {
    Date: string,    
    Time: string,    
    Activity: string,
    Market: string,
    Direction: string,
    Quantity: string,
    Price: string,
    Currency: string,
    Consideration: string,
    Commission: string,
    Charges: string,
    "Cost/Proceeds": string,
    "Conversion rate": string,
    "Order type": string,
    "Venue ID": string,
    "Settled?": string,
    "Settlement date": string,
    "Order ID": string,
}

export interface Positions {
    [market: string] : Position
}

export interface Position {
    ticker?: string,
    tx: Transaction[],
    values_local_ccy?: PriceData[],
    values_cc_fx?: PriceData[],
    values_actual_fx?: PriceData[],
    price_chart?: PriceData[]
}

interface Positions_On_Date {
    [x: string] : Single_Position_On_Date
}

export interface Single_Position_On_Date {
    market_value?: number,
    market_price?: any,
    quantity: number,
    tx: Transaction[],
    quantity_bought: number,
    quantity_sold: number
    cost_local_ccy: number,
    running_cost_local_ccy: number,
    running_cost_base_ccy: number,
    realized_proceeds_local_ccy: number,
    running_realized_proceeds_local_ccy: number,
    running_realized_proceeds_base_ccy: number,
    realized_proceeds_base_ccy: number,
    fees: number,
    cost_base_ccy: number,
    currency: string,
    market?: string,
    avg_entry_cost_base_ccy?: number,
    avg_exit_price_base_ccy?: number,
    avg_entry_cost_local_ccy?: number,
    avg_exit_price_local_ccy?: number,
    avg_running_entry_cost_base_ccy?: number,
    avg_running_exit_price_base_ccy?: number,
    existing_pos?: number,
    unrealized_entry_cost_base_ccy?: number,
    unrealized_entry_cost_local_ccy?: number,
    realized_pnl_base_ccy?: number,
    realized_pnl_base_ccy_2?: number,
    realized_pnl_local_ccy?: number,
    realized_pnl_local_ccy_2?: number,
    unrealized_pnl_local_ccy?: number,
    unrealized_pnl_local_ccy_2?: number,
    total_pnl_local_ccy?: number,
    total_pnl_local_ccy_2?: number,
    unrealized_pnl_base_ccy?: number,
    unrealized_pnl_base_ccy_2?: number,
    total_pnl_base_ccy?: number,
    total_pnl_base_ccy_2?: number,
    ticker?: string,
    average_fx?: number,
    market_value_cc_fx?: number,
    actual_fx?: any,
    market_value_actual_fx?: number,
    contractSize?: number
}

export interface Total_Position_On_Date {
    market_value?: FX,
    market_value_cc_fx?: number, // in base currency
    market_value_actual_fx?: number // in base currency
    date: string,
    date_obj: Date,
    overall_unrealized_cost_base_ccy: number,
    overall_unrealized_cost_local_ccy: FX,
    overall_fees: number,
    pos: Single_Position_On_Date[],
    existing_pos_unrealized_entry_cost_base_ccy?: number,
    overall_unrealized_pnl_base_ccy : number,
    overall_unrealized_pnl_local_ccy: FX,
    overall_unrealized_pnl_base_ccy_2: number,
    overall_unrealized_pnl_local_ccy_2: FX,
    overall_realized_pnl_base_ccy: number,
    overall_realized_pnl_local_ccy: FX,
    overall_realized_pnl_base_ccy_2: number,
    overall_realized_pnl_local_ccy_2: FX,
    overall_total_pnl_base_ccy: number,
    overall_total_pnl_base_ccy_2: number,
    overall_total_pnl_local_ccy: FX,
    overall_total_pnl_local_ccy_2: FX
}

interface FX {
    [x: string] : number
}

interface PriceData {
    date: string,
    value: Number,
    compare_date?: any
}

export const IGAccount = class IGAccount {
    csvData : Array<Object>
    type : string
    setDataLoaded : (a: any) => any
    offlineMode : number
    positions : Positions
    transactions : Array<Transaction>
    load_prices : Array<Object>
    load_currency : Array<Object>
    start_date : Date | string
    end_date : Date | string
    data : any
    dataLoaded : number
    poscalc: Total_Position_On_Date[]
    chartdata : any
    chartdata2 : any
    calc : any
    
    constructor(csvData, type, offlineMode, /* setData, setCalc, setChart, setChart2, setPositions, */ setDataLoaded) {
        this.csvData = csvData;
        this.type = type;
        // this.setData = setData;
        // this.setCalc = setCalc;
        // this.setChart = setChart;
        // this.setChart2 = setChart2;
        // this.setPositions = setPositions;
        this.setDataLoaded = setDataLoaded;
        this.offlineMode = offlineMode;
        if (!offlineMode) {
            // tickers = {};
            // prices = {};
        } else {
            tickers = tickers_offline;
            prices = prices_offline;
        }
        done = 0;
        this.load(csvData, type);
    }

    load(csvData, type) {
        if (type == "ISA" || type == "SHD") {
            this.loadISA(csvData);
        }  else if(type == "CFD") {
            this.loadCFD(csvData);
        }
    }

    parseCFDtx(cfd_tx: TransactionCFD[]): Transaction[] {
        var tx: Transaction[] = [];
        for (var transaction of cfd_tx) {
            if (transaction.ActionStatus == "ACCEPT" && transaction.Result.indexOf("rolled")==-1) {
                var date = new Date(transaction.Date + " " + transaction.Time);
                var contractSizeRegex = /\([^0-9]*([0-9]+)(.*)\)/g;
                var match = transaction.MarketName.matchAll(contractSizeRegex);
                var match2 : any = Array.from(match);
                var contractSize = 1;
                if (match2[0]?.length > 1) {
                    if (match2[0][2] == "oz") {
                        contractSize = Number(match2[0][1])/100;
                    } else {
                        contractSize = Number(match2[0][1]);
                    }
                }
                if(transaction.Epic.substr(0,3)=="OP.") {
                    contractSize = 100;
                }
                var currency;
                if(transaction.Currency == '$') {
                    currency = "USD";
                } else if(transaction.Currency == "£") {
                    currency = "GBP";
                } else if(transaction.Currency == "€") {
                    currency = "EUR";
                } else if(transaction.Currency == "HK") {
                    currency = "HKD";
                } else {
                    currency = transaction.Currency;
                }

                if(transaction.MarketName.indexOf("Weekend ") > -1) {
                    transaction.MarketName = transaction.MarketName.replace("Weekend ","")
                }

                var tx2: Transaction = {
                    Date: date,
                    Currency: currency,
                    Market: transaction.MarketName,
                    Direction: Number(transaction.Size) > 0 ? "BUY" : "SELL",
                    Quantity: transaction.Size,
                    Consideration: (-Number(transaction.Size) * Number(transaction.Level) * contractSize).toString(),
                    Commission: "0",
                    Charges: "0",
                    ContractSize: contractSize.toString(),
                    Epic: transaction.Epic,
                    Price: transaction.Level
                }
                tx.push(tx2);
            }
        }
        return tx;
    }

    loadCFD(csvData) {
        this.positions = {};
        this.transactions = [];
        this.load_prices = [];
        this.load_currency = [];

        var tx = rowsToObjects(csvData[0], csvData.slice(1));
        tx.sort((a, b) => {
            var ad = new Date(a.Date + " " + a.Time).getTime();
            var bd = new Date(b.Date + " " + b.Time).getTime();
            return ad - bd;
        });

        tx = this.parseCFDtx(tx);

        this.start_date = new Date(tx[0].Date);
        if (!this.offlineMode) {
            this.end_date = new Date();
            this.end_date.setHours(0, 0, 0, 0);
        } else {
            var sortedPrices = prices_offline[Object.keys(prices_offline)[0]].sort((a, b) => {
                var compare_date = new Date(a.date);
                var compare_date2 = new Date(b.date);
                return compare_date2.getTime() - compare_date.getTime();
            });
            this.end_date = new Date(sortedPrices[0].date);
            this.end_date.setHours(0, 0, 0, 0);
        }

        for (var i = 0; i < tx.length; i++) {
            //var date = new Date(tx[i].Date + " " + tx[i].Time);
            this.addTransaction(tx[i].Market, tx[i].Date, tx[i]);
        }
        // this.load_prices.push(this.findticker("GBPUSD", "USD"));
        // this.load_prices.push(this.findticker("GBPEUR", "EUR"));
        // this.load_prices.push(this.findticker("GBPHKD", "HKD"));
        this.load_currency.push(this.findticker("GBPUSD", "USD"));
        this.load_currency.push(this.findticker("GBPEUR", "EUR"));
        this.load_currency.push(this.findticker("GBPHKD", "HKD"));
        this.transactions = tx;
        this.data = this.positionsBetweenDate().then((resp)=>{this.data=resp;this.setDataLoaded(1);return resp;});
        // this.dataLoaded = 1;
        //this.setData(this.positionsBetweenDate());
        //var newpos = this.positionAsOfDate(new Date("2020-06-01"));
    }

    loadISA(csvData) {
        this.positions = {};
        this.transactions = [];
        this.load_prices = [];
        this.load_currency = [];

        var tx = rowsToObjects(csvData[0], csvData.slice(1));
        tx.sort((a, b) => {
            var ad = new Date(a.Date + " " + a.Time).getTime();
            var bd = new Date(b.Date + " " + b.Time).getTime();
            return ad - bd;
        });

        this.start_date = new Date(tx[0].Date);
        if (!this.offlineMode) {
            this.end_date = new Date();
            this.end_date.setHours(0, 0, 0, 0);
        } else {
            var sortedPrices = prices_offline[Object.keys(prices_offline)[0]].sort((a, b) => {
                var compare_date = new Date(a.date);
                var compare_date2 = new Date(b.date);
                return compare_date2.getTime() - compare_date.getTime();
            });
            this.end_date = new Date(sortedPrices[0].date);
            this.end_date.setHours(0, 0, 0, 0);
        }

        for (var i = 0; i < tx.length; i++) {
            var date = new Date(tx[i].Date + " " + tx[i].Time);
            this.addTransaction(tx[i].Market, date, tx[i]);
        }
        // this.load_prices.push(this.findticker("GBPUSD", "USD"));
        // this.load_prices.push(this.findticker("GBPEUR", "EUR"));
        this.load_currency.push(this.findticker("GBPUSD", "USD"));
        this.load_currency.push(this.findticker("GBPEUR", "EUR"));
        this.transactions = tx;
        this.data = this.positionsBetweenDate().then((resp)=>{this.data=resp;this.setDataLoaded(1);return resp;});
        //this.dataLoaded = 1;
        
        //this.setData(this.positionsBetweenDate());
        //var newpos = this.positionAsOfDate(new Date("2020-06-01"));
    }

    getData() {
        return this.data;
    }

    addTransaction(market : string, date : Date, data : Transaction) {
        if (!(market in this.positions)) {
            this.positions[market] = { tx: [] };
            this.load_prices.push(this.findticker(market, data.Currency, data).then(ticker => this.positions[market].ticker = ticker));
        }
        data.Date = date;
        this.positions[market].tx.push(data);
    }

    addTransaction2(positions : Positions_On_Date, data : Transaction) {
        if (!(data.Market in positions)) {
            if (data.Direction == "BUY") {
                positions[data.Market] = { tx: [], quantity_bought: parseFloat(data.Quantity), quantity_sold: 0, quantity: parseFloat(data.Quantity), cost_local_ccy: parseFloat(data.Consideration), running_cost_local_ccy: parseFloat(data.Consideration), realized_proceeds_local_ccy: 0, running_realized_proceeds_local_ccy: 0, realized_proceeds_base_ccy: 0, running_realized_proceeds_base_ccy: 0, avg_running_exit_price_base_ccy: 0, fees: parseFloat(data.Commission) + parseFloat(data.Charges), cost_base_ccy: parseFloat(data["Cost/Proceeds"]), running_cost_base_ccy: parseFloat(data["Cost/Proceeds"]), avg_running_entry_cost_base_ccy: parseFloat(data["Cost/Proceeds"])/parseFloat(data.Quantity)/(Number(data.ContractSize)?Number(data.ContractSize):1), currency: data["Currency"], contractSize: Number(data.ContractSize)?Number(data.ContractSize):1 };
            } else {
                positions[data.Market] = { tx: [], quantity_bought: 0, quantity_sold: -parseFloat(data.Quantity), quantity: parseFloat(data.Quantity), cost_local_ccy: 0, running_cost_local_ccy: 0, realized_proceeds_local_ccy: parseFloat(data.Consideration), running_realized_proceeds_local_ccy: parseFloat(data.Consideration), realized_proceeds_base_ccy: -parseFloat(data["Cost/Proceeds"]), running_realized_proceeds_base_ccy: -parseFloat(data["Cost/Proceeds"]), avg_running_exit_price_base_ccy: parseFloat(data["Cost/Proceeds"])/parseFloat(data.Quantity)/(Number(data.ContractSize)?Number(data.ContractSize):1), fees: parseFloat(data.Commission) + parseFloat(data.Charges), cost_base_ccy: 0, running_cost_base_ccy: 0, avg_running_entry_cost_base_ccy: 0, currency: data["Currency"], contractSize: Number(data.ContractSize)?Number(data.ContractSize):1 };
            }

        } else {
            const close_dir = parseFloat(data.Quantity) / positions[data.Market].quantity;
            const close_amount = Math.min(Math.abs(parseFloat(data.Quantity)),Math.abs(positions[data.Market].quantity)) * (parseFloat(data.Quantity)>0?1:-1);
            //if(this.type=="CFD"){
                if (Math.abs(positions[data.Market].quantity)> 0.000001 && close_dir < 0) {
                    const consideration_price_local_ccy = parseFloat(data.Consideration) / parseFloat(data.Quantity);
                    const consideration_local_ccy = consideration_price_local_ccy * close_amount;
                    const local_ccy_pnl = consideration_local_ccy - (Math.abs(close_amount) * (data.Direction == "BUY" ?
                        positions[data.Market].running_realized_proceeds_local_ccy / positions[data.Market].quantity :
                        -positions[data.Market].running_cost_local_ccy / positions[data.Market].quantity));
                    const base_ccy_pnl = data.Direction == "BUY" ? 
                    (Math.abs(close_amount) * positions[data.Market].contractSize * positions[data.Market].avg_running_exit_price_base_ccy + parseFloat(data["Cost/Proceeds"])) : (-parseFloat(data["Cost/Proceeds"]) + Math.abs(close_amount) * positions[data.Market].contractSize *
                        positions[data.Market].avg_running_entry_cost_base_ccy);
                    var fx: any = 1;
                    var compare_date = new Date(data.Date);
                    compare_date.setUTCHours(5, 0, 0, 0);
                    var compare_time = compare_date.getTime();
                    if (prices["GBP" + positions[data.Market].currency]) {
                        fx = prices["GBP" + positions[data.Market].currency].find(element => {
                            return element.date.getTime() == compare_time;
                        }) || 0;
                        if (fx) {
                            fx = fx.close ?? 1;
                        }
                    }
                //     if(data.Market=="Wall Street Cash ($10)") {
                //         console.log("a");
                //         console.log("closing "+data.Date+" "+close_amount+" "+data.Market+" "+local_ccy_pnl+" "+fx);
                // }
                    // console.log("closing "+close_amount+data.Market+local_ccy_pnl+" "+local_ccy_pnl/fx);

                    positions[data.Market].realized_pnl_base_ccy_2 = (positions[data.Market].realized_pnl_base_ccy_2?positions[data.Market].realized_pnl_base_ccy_2:0) + (this.type=="CFD"?local_ccy_pnl/fx:base_ccy_pnl);
                    positions[data.Market].realized_pnl_local_ccy_2 = (positions[data.Market].realized_pnl_local_ccy_2?positions[data.Market].realized_pnl_local_ccy_2:0) + local_ccy_pnl;
                }
            //} 

            if (Math.abs(positions[data.Market].quantity) > 0.000001 && close_dir < 0) {
                if(data.Direction == "BUY") {
                    const avg_exit = positions[data.Market].running_realized_proceeds_local_ccy / positions[data.Market].quantity;
                    positions[data.Market].running_realized_proceeds_local_ccy += avg_exit*close_amount;
                } else {
                    const avg_entry = positions[data.Market].running_cost_local_ccy / positions[data.Market].quantity;
                    positions[data.Market].running_cost_local_ccy += avg_entry*close_amount;
                }

                let delta = Math.abs(Number(data.Quantity) - close_amount);
                if(delta > 0.00001) {
                    positions[data.Market].running_cost_local_ccy += data.Direction == "BUY" ? (parseFloat(data.Consideration)/Number(data.Quantity)*delta) : 0;
                    positions[data.Market].running_realized_proceeds_local_ccy += data.Direction == "SELL" ? (-parseFloat(data.Consideration)/Number(data.Quantity)*delta) : 0;
                }
            } else {
                positions[data.Market].running_cost_local_ccy += data.Direction == "BUY" ? parseFloat(data.Consideration) : 0;
                positions[data.Market].running_realized_proceeds_local_ccy += data.Direction == "SELL" ? parseFloat(data.Consideration) : 0;
            }

            if(positions[data.Market].quantity > 0.00001) {
                if(parseFloat(data.Quantity) > 0.00001) {
                    positions[data.Market].avg_running_entry_cost_base_ccy =  (positions[data.Market].avg_running_entry_cost_base_ccy * positions[data.Market].quantity * positions[data.Market].contractSize + parseFloat(data["Cost/Proceeds"]))/(positions[data.Market].quantity + parseFloat(data.Quantity))/positions[data.Market].contractSize;
                }
                positions[data.Market].avg_running_exit_price_base_ccy = 0;
            } else if(positions[data.Market].quantity < -0.00001) {
                if(parseFloat(data.Quantity) < -0.00001) {
                    positions[data.Market].avg_running_exit_price_base_ccy =  (positions[data.Market].avg_running_exit_price_base_ccy * positions[data.Market].quantity * positions[data.Market].contractSize + parseFloat(data["Cost/Proceeds"]))/(positions[data.Market].quantity + parseFloat(data.Quantity))/positions[data.Market].contractSize;
                }
                positions[data.Market].avg_running_entry_cost_base_ccy = 0;
            } else {
                if(data.Direction == "BUY") {
                    positions[data.Market].avg_running_entry_cost_base_ccy = parseFloat(data["Cost/Proceeds"])/parseFloat(data.Quantity)/positions[data.Market].contractSize;
                    positions[data.Market].avg_running_exit_price_base_ccy = 0;
                } else {
                    positions[data.Market].avg_running_exit_price_base_ccy = parseFloat(data["Cost/Proceeds"])/parseFloat(data.Quantity)/positions[data.Market].contractSize;
                    positions[data.Market].avg_running_entry_cost_base_ccy = 0;
                }
            }

            positions[data.Market].quantity += parseFloat(data.Quantity);
            positions[data.Market].quantity_bought += data.Direction == "BUY" ? parseFloat(data.Quantity) : 0;
            positions[data.Market].quantity_sold += data.Direction == "SELL" ? -parseFloat(data.Quantity) : 0;
            positions[data.Market].cost_local_ccy += data.Direction == "BUY" ? parseFloat(data.Consideration) : 0;
            positions[data.Market].realized_proceeds_local_ccy += data.Direction == "SELL" ? parseFloat(data.Consideration) : 0;
            positions[data.Market].fees += parseFloat(data.Commission) || 0 + parseFloat(data.Charges) || 0;
           
            
            positions[data.Market].cost_base_ccy = positions[data.Market].cost_base_ccy + (data.Direction == "BUY" ? parseFloat(data["Cost/Proceeds"]) : 0);
            positions[data.Market].running_cost_base_ccy = positions[data.Market].avg_running_entry_cost_base_ccy * positions[data.Market].quantity;
            positions[data.Market].realized_proceeds_base_ccy = positions[data.Market].realized_proceeds_base_ccy + (data.Direction == "SELL" ? -parseFloat(data["Cost/Proceeds"]) : 0);
            positions[data.Market].running_realized_proceeds_base_ccy = positions[data.Market].avg_running_exit_price_base_ccy * -positions[data.Market].quantity;

            
            
        }
        positions[data.Market].tx.push(data);
    }

    positionAsOfDate(date) : Total_Position_On_Date {
        var positions : Positions_On_Date = {};
        var positions2 : Single_Position_On_Date[] = [];
        for (var i = 0; i < this.transactions.length; i++) {
            var txd = new Date(this.transactions[i].Date);
            txd.setHours(0, 0, 0, 0);
            if (txd <= date) {
                this.addTransaction2(positions, this.transactions[i]);
            } else {
                break;
            }
        }

        var overall_unrealized_cost_local_ccy = {};
        var overall_unrealized_cost_base_ccy = 0;
        var overall_realized_pnl_base_ccy = 0;
        var overall_realized_pnl_base_ccy_2 = 0;
        var overall_realized_pnl_local_ccy = {};
        var overall_realized_pnl_local_ccy_2 = {};
        var overall_fees = 0;

        for (var key of Object.keys(positions)) {
            positions[key].market = key;
            positions[key].avg_entry_cost_base_ccy = positions[key].cost_base_ccy / positions[key].quantity_bought / positions[key].contractSize;
            positions[key].avg_entry_cost_local_ccy = positions[key].cost_local_ccy / positions[key].quantity_bought / positions[key].contractSize;
            positions[key].avg_exit_price_base_ccy = positions[key].realized_proceeds_base_ccy / positions[key].quantity_sold / positions[key].contractSize;
            positions[key].avg_exit_price_local_ccy = positions[key].realized_proceeds_local_ccy / positions[key].quantity_sold / positions[key].contractSize;
            positions[key].existing_pos = Math.abs(positions[key].quantity) > 0.0000001 ? 1 : 0;
            positions[key].unrealized_entry_cost_base_ccy = positions[key].avg_entry_cost_base_ccy * positions[key].quantity * positions[key].contractSize;
            positions[key].unrealized_entry_cost_local_ccy = positions[key].avg_entry_cost_local_ccy * positions[key].quantity * positions[key].contractSize;
            positions[key].realized_pnl_base_ccy = 0;
            positions[key].realized_pnl_local_ccy = 0;
            if (positions[key].quantity_bought > 0 && positions[key].quantity_sold > 0) {
                var realized = Math.min(positions[key].quantity_bought, positions[key].quantity_sold);
                positions[key].realized_pnl_base_ccy = (positions[key].avg_exit_price_base_ccy + positions[key].avg_entry_cost_base_ccy) * realized * positions[key].contractSize;
                positions[key].realized_pnl_local_ccy = (positions[key].avg_exit_price_local_ccy + positions[key].avg_entry_cost_local_ccy) * realized * positions[key].contractSize;
            }

            overall_unrealized_cost_base_ccy += positions[key].unrealized_entry_cost_base_ccy;
            // if(new Date(date).toLocaleDateString("en-CA")=='2021-05-14'){
                
            //         console.log("ondate "+key)
            //         console.log("adding "+positions[key].unrealized_entry_cost_base_ccy+" "+overall_unrealized_cost_base_ccy)
                
            // }

            overall_unrealized_cost_local_ccy[positions[key].currency] = (overall_unrealized_cost_local_ccy[positions[key].currency] || 0) + positions[key].unrealized_entry_cost_local_ccy;
            overall_realized_pnl_base_ccy += positions[key].realized_pnl_base_ccy ?? 0;
            overall_realized_pnl_base_ccy_2 += positions[key].realized_pnl_base_ccy_2 ?? 0;
            overall_realized_pnl_local_ccy[positions[key].currency] = ((overall_realized_pnl_local_ccy[positions[key].currency]) ?? 0) + ((positions[key].realized_pnl_local_ccy != undefined) ? positions[key].realized_pnl_local_ccy : 0);
            overall_realized_pnl_local_ccy_2[positions[key].currency] = ((overall_realized_pnl_local_ccy_2[positions[key].currency]) ?? 0) + ((positions[key].realized_pnl_local_ccy_2 != undefined) ? positions[key].realized_pnl_local_ccy_2 : 0);
            overall_fees += positions[key].fees;

            let key2=key;

            this.load_prices.push(this.findticker(key2, positions[key].currency,positions[key].tx[0] ).then(ticker => 
                positions[key2].ticker = ticker));

            positions2.push(positions[key]);
            
        }

        var date_obj = new Date(date);

        return { date: date_obj.toLocaleDateString("en-CA"), date_obj: date_obj, overall_unrealized_cost_base_ccy, overall_unrealized_cost_local_ccy, overall_realized_pnl_base_ccy, overall_realized_pnl_base_ccy_2, overall_realized_pnl_local_ccy_2, overall_realized_pnl_local_ccy, overall_fees, pos: positions2,overall_unrealized_pnl_local_ccy:{}, overall_total_pnl_local_ccy:{},overall_unrealized_pnl_base_ccy:0, overall_total_pnl_base_ccy:0,overall_unrealized_pnl_local_ccy_2:{}, overall_total_pnl_local_ccy_2:{}, overall_total_pnl_base_ccy_2:0, overall_unrealized_pnl_base_ccy_2:0 };
    }

    async positionsBetweenDate() {
        var i = new Date(this.start_date);
        var to = this.end_date;
        var positions : Total_Position_On_Date[] = [];

        await Promise.all(this.load_currency);
        console.log("currency loaded");
        console.log(prices);

        while (i <= to) {
            var pos : Total_Position_On_Date = this.positionAsOfDate(i);
            positions.push(pos);
            i.setDate(i.getDate() + 1);
        }
        this.poscalc = positions;

        Promise.all(this.load_prices).then(()=>this.calcPosition(this.poscalc));

        return positions;
    }

    async findticker(name : string, fx : string, tx? : Transaction) : Promise<string> {
        var ticker;
        if (!this.offlineMode) {
            if (name in tickers && tickers_dates[name].getTime() <= new Date(this.start_date).getTime()) return tickers[name];
            //tickers[name] = "[PROCESSING]";
            var header = { headers: { "accept": "*/*", 'Authorization': 'Basic ' + btoa('admin:secure_password'), } };
            console.log('calling fetch' + name);
            //const resp = await fetch("https://faasd.tyap.cloud/function/igapi?name=" + name + "&fx=" + fx, header);
            //ar ticker;
            tickers_dates[name] = this.start_date;
            tickers[name] = fetch("https://faasd.tyap.cloud/function/igapi?name=" + name + "&fx=" + fx + (tx?.Epic?"&epic="+tx.Epic:""), header).then(resp => resp.text()).then(resp => {
                ticker = resp;
                var resp2;
                // var resp = ticker;
                //if (ticker != "[TICKER]")
                if(ticker[0]!='[')
                    resp2 = this.getprices(name, ticker, this.start_date, this.end_date).then(()=>{return ticker}).catch(()=>{console.log("didn't fetched prices");return ticker;});

                tickers[name] = ticker;
                return resp2;
                
                // return resp;
            }).catch(()=>{console.log("didn't fetched");ticker = tickers_offline[name];return ticker;});
            await tickers[name];
            console.log(ticker);
            tickers[name] = ticker;
            return ticker;
        } else {
            ticker = tickers[name];
            var resp = ticker;
            //if (ticker != "[TICKER]")
            if(ticker && ticker[0]!='[')
                resp = this.getprices(name, ticker, this.start_date, this.end_date).then(()=>{return ticker});
            return resp;
        }
        // var resp = ticker;
        // //if (ticker != "[TICKER]")
        // if(ticker[0]!='[')
        //     resp = this.getprices(name, ticker, this.start_date, this.end_date).then(()=>{return ticker});
        // return resp;
    }

    async getprices(name, ticker, from, to) {
        var price;
        if (!this.offlineMode) {
            from = from.toLocaleDateString("en-CA");
            to = to.toLocaleDateString("en-CA");
            // if (name in prices) return prices[name];
            prices[name] = [];
            var header = { headers: { "accept": "*/*", 'Authorization': 'Basic ' + btoa('admin:secure_password'), } };
            //console.log('calling fetch'+name+" ticker "+ticker);
            try {
            const resp = await fetch("https://faasd.tyap.cloud/function/igapi2?ticker=" + ticker + "&from=" + from + "&to=" + to, header);
            price = await resp.json();
            price.forEach((element)=>element.date=new Date(element.date));
            //console.log("name "+name+JSON.stringify(price));
            prices[name] = price;
            } catch (err) {
                prices[name] = prices_offline[name];
                prices[name].forEach((element)=>element.date=new Date(element.date));
                console.log("didnt fetch prices");
            }
        } else {
            if(this.getallprices()) return price;
            prices[name].forEach((element)=>element.date=new Date(element.date));
            price = prices[name];
        }
        done++;
        console.log("done" + done);
        //if (this.getallprices()) {
        //    this.calcPosition(this.poscalc);
        //}
        return price;
    }

    getallprices() {
        if (done == Object.keys(prices).length && done > 0) {
            return prices;
        }
        return null;
    }

    calcPosition(positions : Total_Position_On_Date[]) {
        for (var position_day of positions) {
            position_day.market_value = {};
            position_day.existing_pos_unrealized_entry_cost_base_ccy = 0;
            position_day.overall_realized_pnl_base_ccy = 0;
            var compare_date = new Date(position_day.date);
            compare_date.setUTCHours(5);
            var compare_time = compare_date.getTime();
            for (var position of position_day.pos) {
                if (prices[position.market]) { 
                    position.market_price = prices[position.market].find(element => {
                        //var new_date = new Date(element.date);
                        //var new_date = new Date(element.date);
                        return element.date.getTime() == compare_time;
                    }) || 0;

                    if(position.currency=="GBP" && (this.type=="ISA" || this.type=="SHD")){
                        position.market_price.close = position.market_price.close/100;
                    }

                    position.actual_fx = 1;
                    if (position.currency != "GBP") {
                        // console.log("GBP" + position.currency);
                        position.actual_fx = prices["GBP" + position.currency].find(element => {
                            // var new_date = new Date(element.date);
                            // var compare_date = new Date(position_day.date);
                            // compare_date.setUTCHours(5);
                            return element.date.getTime() == compare_time;
                        }) || 0;
                        if (position.actual_fx) {
                            position.actual_fx = position.actual_fx.close ?? 1;
                        }
                    }

                    position.market_value = position.market_price.close * position.quantity * position.contractSize;

                    position.unrealized_pnl_local_ccy = (position.market_value + (position.quantity > 0.00001 ?position.unrealized_entry_cost_local_ccy:-position.avg_exit_price_local_ccy*position.quantity*position.contractSize));

                    position.total_pnl_local_ccy = (position.realized_pnl_local_ccy??0) + (position.unrealized_pnl_local_ccy??0)

                    if (this.type == "CFD") {
                        position.unrealized_pnl_base_ccy = position.unrealized_pnl_local_ccy / position.actual_fx;
                        position.realized_pnl_base_ccy = (position.realized_pnl_local_ccy??0) / position.actual_fx;
                        position.total_pnl_base_ccy = position.total_pnl_local_ccy / position.actual_fx;
                    } else {
                        position.unrealized_pnl_base_ccy = position.market_value/position.actual_fx + (position.quantity*position.contractSize*(position.quantity > 0.00001 ?position.avg_entry_cost_base_ccy:-position.avg_exit_price_base_ccy));
                        position.total_pnl_base_ccy = (position.realized_pnl_base_ccy??0) + (position.unrealized_pnl_base_ccy??0)
                    }

                    position.unrealized_pnl_local_ccy_2 = (position.market_value + (Math.abs(position.running_cost_local_ccy)>0.000001?position.running_cost_local_ccy:position.running_realized_proceeds_local_ccy));
                    position.total_pnl_local_ccy_2 = (position.realized_pnl_local_ccy_2??0) + (position.unrealized_pnl_local_ccy_2??0);

                    if (this.type == "CFD") {
                        position.unrealized_pnl_base_ccy_2 = position.unrealized_pnl_local_ccy_2/position.actual_fx;
                        position.total_pnl_base_ccy_2 = (position.realized_pnl_base_ccy_2??0) + (position.unrealized_pnl_base_ccy_2??0)
                    } else {
                        position.unrealized_pnl_base_ccy_2 = (position.market_value / position.actual_fx + (position.quantity * position.contractSize * (position.quantity > 0.00001 ? position.avg_running_entry_cost_base_ccy : -position.avg_running_exit_price_base_ccy)));
                        position.total_pnl_base_ccy_2 = (position.realized_pnl_base_ccy_2??0) + (position.unrealized_pnl_base_ccy_2??0)
                    }

                    position_day.overall_unrealized_pnl_base_ccy = (position_day.overall_unrealized_pnl_base_ccy??0) + position.unrealized_pnl_base_ccy;
                    position_day.overall_realized_pnl_base_ccy = (position_day.overall_realized_pnl_base_ccy??0) + position.realized_pnl_base_ccy;
                    position_day.overall_total_pnl_base_ccy = (position_day.overall_total_pnl_base_ccy??0) + position.total_pnl_base_ccy;

                    if (!(position.currency in position_day.overall_unrealized_pnl_local_ccy)) {
                        position_day.overall_unrealized_pnl_local_ccy[position.currency] = position.unrealized_pnl_local_ccy;
                    } else {
                        position_day.overall_unrealized_pnl_local_ccy[position.currency] += position.unrealized_pnl_local_ccy;
                    }

                    if (!(position.currency in position_day.overall_total_pnl_local_ccy)) {
                        position_day.overall_total_pnl_local_ccy[position.currency] = position.total_pnl_local_ccy;
                    } else {
                        position_day.overall_total_pnl_local_ccy[position.currency] += position.total_pnl_local_ccy;
                    }

                    position_day.overall_unrealized_pnl_base_ccy_2 = (position_day.overall_unrealized_pnl_base_ccy_2??0) + position.unrealized_pnl_base_ccy_2;
                    // position_day.overall_realized_pnl_base_ccy_2 = (position_day.overall_realized_pnl_base_ccy_2??0) + position.realized_pnl_base_ccy_2;
                    position_day.overall_total_pnl_base_ccy_2 = (position_day.overall_total_pnl_base_ccy_2??0) + position.total_pnl_base_ccy_2;

                    if (!(position.currency in position_day.overall_unrealized_pnl_local_ccy_2)) {
                        position_day.overall_unrealized_pnl_local_ccy_2[position.currency] = position.unrealized_pnl_local_ccy_2;
                    } else {
                        position_day.overall_unrealized_pnl_local_ccy_2[position.currency] += position.unrealized_pnl_local_ccy_2;
                    }

                    if (!(position.currency in position_day.overall_total_pnl_local_ccy_2)) {
                        position_day.overall_total_pnl_local_ccy_2[position.currency] = position.total_pnl_local_ccy_2;
                    } else {
                        position_day.overall_total_pnl_local_ccy_2[position.currency] += position.total_pnl_local_ccy_2;
                    }

                    if (!(position.currency in position_day.market_value)) {
                        position_day.market_value[position.currency] = position.market_value;
                    } else {
                        position_day.market_value[position.currency] += position.market_value;
                    }
                    position.average_fx = position.cost_local_ccy / position.cost_base_ccy;
                    position.market_value_cc_fx = position.market_value / position.average_fx;
                    if (!position_day.market_value_cc_fx) {
                        position_day.market_value_cc_fx = position.market_value_cc_fx;
                    } else {
                        position_day.market_value_cc_fx += position.market_value_cc_fx;
                    }                   

                    position.market_value_actual_fx = position.market_value / position.actual_fx;
                    if (!position_day.market_value_actual_fx) {
                        position_day.market_value_actual_fx = position.market_value_actual_fx;
                    } else {
                        position_day.market_value_actual_fx += position.market_value_actual_fx;
                    }

                    if (positions[positions.length - 1].pos.find((element) => element.market == position.market).existing_pos == 1) {
                        position_day.existing_pos_unrealized_entry_cost_base_ccy += position.unrealized_entry_cost_base_ccy;
                    }

                    // if(position_day.date=='2021-05-14'){
                    //     if (positions[positions.length - 1].pos.find((element) => element.market == position.market).existing_pos == 1) {
                    //         console.log("existing pos"+position.market)
                    //         console.log("adding "+position.unrealized_entry_cost_base_ccy+" "+position_day.existing_pos_unrealized_entry_cost_base_ccy)
                    //     }
                    // }

                    if (!this.positions[position.market].values_local_ccy) {
                        this.positions[position.market].values_local_ccy = [];
                    }

                    this.positions[position.market].values_local_ccy.push({ date: position_day.date, value: position.market_value });

                    if (!this.positions[position.market].values_cc_fx) {
                        this.positions[position.market].values_cc_fx = [];
                    }

                    this.positions[position.market].values_cc_fx.push({ date: position_day.date, value: position.market_value_cc_fx });

                    if (!this.positions[position.market].values_actual_fx) {
                        this.positions[position.market].values_actual_fx = [];
                    }

                    this.positions[position.market].values_actual_fx.push({ date: position_day.date, value: position.market_value_actual_fx });

                    if (!this.positions[position.market].price_chart) {
                        this.positions[position.market].price_chart = [];
                    }

                    this.positions[position.market].price_chart.push({ date: position_day.date, value: position.market_price, compare_date: new Date(position_day.date).getTime() });
                }
            }
        }
        var searchdata = positions.map((element) => {

            var USD_FX = prices["GBPUSD"].find(element2 => {
                var new_date = new Date(element2.date);
                var compare_date = new Date(element.date);
                compare_date.setUTCHours(5);
                return new_date.getTime() == compare_date.getTime();
            }) || 0;

            var EUR_FX = prices["GBPEUR"].find(element2 => {
                var new_date = new Date(element2.date);
                var compare_date = new Date(element.date);
                compare_date.setUTCHours(5);
                return new_date.getTime() == compare_date.getTime();
            }) || 0;

            var value = (element.market_value["USD"] ?? 0) / USD_FX.close + (element.market_value["EUR"] ?? 0) / EUR_FX.close + (element.market_value["GBP"] ?? 0);

            return { x: element.date, y: value, category: "value" };
        });

        var searchdata2 = positions.map((element) => {

            var USD_FX = 1.35;

            var EUR_FX = 1.10;

            //var value = (element.market_value["USD"]??0) / USD_FX + (element.market_value["EUR"]??0) / EUR_FX + (element.market_value["GBP"]??0) / 100;
            var value = element.market_value_cc_fx || 0;

            return { x: element.date, y: value, category: "value_constant_currency" };
        });

        var searchdata3 = positions.map((element) => {

            var value = -element.existing_pos_unrealized_entry_cost_base_ccy || 0;

            return { x: element.date, y: value, category: "existing_pos_unrealized_cost" };
        });

        var searchdata4 = positions.map((element) => {

            // var value = -element.existing_pos_unrealized_entry_cost_base_ccy || 0;

            return { x: element.date, y: element.overall_total_pnl_base_ccy_2, realized: element.overall_realized_pnl_base_ccy, unrealized: element.overall_unrealized_pnl_base_ccy, total: element.overall_total_pnl_base_ccy, category: "overall" };
        });

        this.chartdata = [];
        this.chartdata2 = {};

        for (let [key, value] of Object.entries(this.positions)) {
            if (this.positions[key].ticker != "[TICKER]" && prices[key]) {
                var result = this.getPositionPrices(key);
                this.chartdata = this.chartdata.concat(result);
                this.chartdata2[key] = result;
            }
        }

        if(this.type=="ISA"||this.type=="SHD") {
            this.calc = searchdata.concat(searchdata2).concat(searchdata3).concat(searchdata4);
        } else if (this.type=="CFD") {
            this.calc = searchdata4;
        }

        this.setDataLoaded(2);
        // this.setCalc(searchdata.concat(searchdata2).concat(searchdata3));
        // this.setChart(this.chartdata);
        // this.setChart2(this.chartdata2);
        // this.setPositions(this.positions);
        return positions;
    }

    getCalc() {
        return this.calc;
    }

    getPosition(market) {
        return this.positions[market];
    }

    getPositionPrices(market, fx = "actual") {
        if (fx == "actual") {
            return this.positions[market].values_actual_fx.map((element) => { return { x: element.date, y: element.value, category: market + " " + fx } })
        } else if (fx == "cc") {
            return this.positions[market].values_cc_fx.map((element) => { return { x: element.date, y: element.value, category: market + " " + fx } })
        } else {
            return this.positions[market].values_local_ccy.map((element) => { return { x: element.date, y: element.value, category: market + " " + fx } })
        }
    }

};

function rowsToObjects(headers, rows) {
    return rows.reduce((acc, e, idx) => {
        acc.push(headers.reduce((r, h, i) => { r[h] = e[i]; return r; }, {}))
        return acc;
    }, []);
}

