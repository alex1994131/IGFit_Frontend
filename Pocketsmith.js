import { txdata2, txdata1 } from "./txdata";
import { dateStr } from "./utils";

const X_DEVELOPER_KEY = "";

export async function getTotal() {
    var url = "https://api.pocketsmith.com/v2/users/1/transactions";
    var header = { headers: { "x-developer-key": X_DEVELOPER_KEY, "accept": "application/json" } };
    var response = await fetch(url, header).catch(()=>console.log("didn't fetch tx"));
    return parseInt(response?.headers.get("total"));
}

export async function getTotal2() {
    var url = "https://faasd.tyap.cloud/function/gettotal";
    //var header = { headers: { "accept": "application/text" } };
    var header = { headers: { "x-developer-key": X_DEVELOPER_KEY, "accept": "application/json", 'Authorization': 'Basic ' + btoa('admin:secure_password'), } };
    var response = await fetch(url).catch(()=>console.log("didn't fetch total"));
    return await response.json();
}

export async function fetchAllTransactions(offlineMode=0) {
    if(offlineMode) return txdata1;
    var jsondata = new Array();

    var pages = Math.ceil(await getTotal2() / 100);
    //pages = 5;

    var header = { headers: { "x-developer-key": X_DEVELOPER_KEY, "accept": "application/json", 'Authorization': 'Basic ' + btoa('admin:secure_password'), } };

    // for (var i = 0; i < pages; i++) {
    //     //var url = "https://api.pocketsmith.com/v2/users/162199/transactions?per_page=100&page=" + (i + 1);
    //     var url = "https://faasd.tyap.cloud/function/pocketsmithtx2?per_page=100&page=" + (i + 1);
    //     var response = await fetch(url, header);
    //     //var tx = await response.json();
    //     jsondata = jsondata.concat(...(await response.json()));
    // }

    var tx_response = []
    var response2 = [];
    for (var i = 0; i < pages; i++) {
        //var url = "https://api.pocketsmith.com/v2/users/162199/transactions?per_page=100&page=" + (i + 1);
        var url = "https://faasd.tyap.cloud/function/pocketsmithtx2?per_page=100&page=" + (i + 1);
        tx_response.push(fetch(url, header).catch(()=>console.log("didn't fetch tx")));
    }

    await Promise.all(tx_response).then((response) => {
        response.forEach(async (tx) => {
            try{
                response2.push(tx.json());
            } catch (err) {
                console.log("json err");
            }
        });
    }).catch(()=>console.log("first err"));

    await Promise.all(response2).then((tx) => {
        tx.forEach((tx2) => { jsondata = jsondata.concat(...tx2); });
    }).catch(()=>console.log("second err"));

    //         var data = await tx.json();console.log(data);
    //     //tx.json().then((json)=>jsondata.concat(...json)));});
    //     jsondata = jsondata.concat(...data);});
    //     return jsondata;
    // }
    //     );

    return jsondata.length? jsondata:txdata1;
}

export async function updatePocketsmithData(id, column, value) {
    var header = { headers: { "accept": "*/*", 'Authorization': 'Basic ' + btoa('admin:secure_password'), } };

    var resp = await fetch("https://faasd.tyap.cloud/function/pocketsmithtx3?id=" + id + "&column=" + column + "&value=" + value, header);

    return resp.ok;
}

export async function getPocketsmithStatus() {
    var header = { headers: { "accept": "*/*", 'Authorization': 'Basic ' + btoa('admin:secure_password'), } };

    var resp;
    try {
        resp = await fetch("https://faasd.tyap.cloud/function/pocketsmithtx?lastupdate", header);
        if (resp) {
            resp = await resp.json();
        }
    } catch (err) {
        console.log(err);
    }

    return resp;
}

export async function updatePocketsmithTransactions() {
    var header = { headers: { "accept": "*/*", 'Authorization': 'Basic ' + btoa('admin:secure_password'), } };

    var resp;
    try {
        resp = await fetch("https://faasd.tyap.cloud/function/pocketsmithtx?updatetransactions", header);
    } catch (err) {
        console.log(err);
    }

    return resp;
}

const TRANSACTION_ACCOUNT_NAME_COLUMN="transaction_account.name"
const AMOUNT_COLUMN="amount_in_base_currency"
const DATE_COLUMN="date"

export const TxAccount = class TxAccount {
    full_tx;
    tx;
    name;
    balances;

    constructor(full_tx, name, name_col=TRANSACTION_ACCOUNT_NAME_COLUMN){
        this.full_tx=full_tx;
        this.name=name;
        this.tx=full_tx.filter(e=>e[name_col]==name);
        this.tx.sort((a,b)=>new Date(a[DATE_COLUMN]).getTime() - new Date(b[DATE_COLUMN]).getTime())
        this.balances={};
    }

    balanceToDate(date, [previousIndex = 0, previousBalance = 0], amount_col = AMOUNT_COLUMN) {
        var balance = previousBalance;
        for (var i = previousIndex; i < this.tx.length; i++) {
            var txd = new Date(this.tx[i].date);
            txd.setHours(0, 0, 0, 0);
            if (txd <= date.dateobj) {
                balance += this.tx[i][amount_col];
            } else {
                break;
            }
        }
        this.balances[date.date] = balance;
        return [balance,[i,balance]];
    }
}

export const TxAccountBalance = class TxAccountBalance {
    txAccount;
    date;
    balance_in_base_currency;
    name;

    constructor(date, txAccount, balance) {
        this.date=date;
        this.txAccount=txAccount;
        this.balance_in_base_currency=balance;
        this.name=txAccount.name;
    }
}

export const PxBalanceHistory = class PxBalanceHistory {
    date;
    account_balances;
    total_balance_in_base_currency;

    constructor(date, account_balances) {
        this.date = date;
        this.account_balances = account_balances;
        this.total_balance_in_base_currency = 0;

        for(let account of account_balances) {
            this.total_balance_in_base_currency += account.balance_in_base_currency;
        }
    }
}

export const Px = class Px {
    tx;
    accounts;
    balance_history;
    account_total;

    constructor(tx) {
        this.tx=tx;
        this.accounts={}
        this.balance_history=[]

        let names = this.getAllAccountNames();
        let previousIndex = {};
        for(let i of names) {
            this.addAccount(i);
            previousIndex[i] = [0,0];
        }

        this.account_total={name:"Total"};

        let dates = tx.map(e=>{return {date:e[DATE_COLUMN], dateobj:new Date(e[DATE_COLUMN]), date_timestamp:new Date(e[DATE_COLUMN]).getTime()}}).sort((a,b)=>a.date_timestamp-b.date_timestamp);
        let start_date=dates[0];
        let end_date=dates[dates.length-1];
        let date = new Date(start_date.dateobj);

        for(;date.getTime()<=end_date.date_timestamp;) {
            let account_balances = [];
            let date_str = dateStr(date);
            let date_obj = {date: date_str, dateobj:date, date_timestamp:date.getTime()};
            for (let [name,account] of Object.entries(this.accounts)) {
                let balance;
                [balance, previousIndex[name]] = account.balanceToDate(date_obj,previousIndex[name]);
                account_balances.push(new TxAccountBalance(date_obj,account,balance));
            }
            let balance_history_added = new PxBalanceHistory(date_str, account_balances);
            this.balance_history.push(balance_history_added);
            this.account_total = {...this.account_total, [date_str]:balance_history_added.total_balance_in_base_currency}
            date.setUTCDate(date.getUTCDate() + 1);
        }

        console.log("Added "+Object.keys(this.accounts).length+"accounts and "+this.balance_history.length+" dates with balances");
        console.log(this.balance_history);

        let balances_data = this.getBalancesAsData();
        console.log(balances_data);
    }

    getAllAccountNames(name_col=TRANSACTION_ACCOUNT_NAME_COLUMN) {
        let accounts={}
        for(let i=0;i<this.tx.length;i++){
            accounts[this.tx[i][name_col]] = 1;
        }
        return Object.keys(accounts);
    }

    addAccount(name) {
        this.accounts[name] = new TxAccount(this.tx, name);
    }

    getBalancesAsData() {
        // let data = []
        // let account_data = {};
        // for (let balance of this.balance_history) {
        //     for(let account of balance.account_balances) {
        //         account_data[account.name] = {...account_data[account.name], [balance.date]:account.balance_in_base_currency};
        //     }
        //     account_data["total"] = {...account_data["total"], [balance.date]:balance.total_balance_in_base_currency};
        // }
        //return Object.entries(account_data).map(([a,b])=>{return {name:a, ...b}});

        let resp = Object.entries(this.accounts).map(([a,b])=>{return {name:a, ...b.balances}});
        resp = [this.account_total, ...resp];
        return resp;
    }
}