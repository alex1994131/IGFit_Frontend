import booleanParser from 'boolean-parser';

export function findmatches3(searchQuery, row, columns, col_amount, saved_query = {}) {
    try {
        var parsedQuery;
        let acc_result;
        let accumulators = [];
        if (saved_query.searchQuery != searchQuery) {
            saved_query.searchQuery = searchQuery;
            ({ parsedQuery, accumulators } = getQueryAndAccFromSearch(searchQuery));
            acc_result = getAccumulators(accumulators, columns);

            let columnnames = columns.map((e) => e.name);
            let amount_col = columnnames.indexOf(col_amount);
            let date_col = columnnames.indexOf("date");

            saved_query.parsedQuery = parsedQuery;
            saved_query.accumulators = accumulators;
            saved_query.acc_result = acc_result;
            saved_query.amount_col = amount_col;
            saved_query.date_col = date_col;
        }
    } catch (err) {
        console.log(err);
    }

    //console.log(JSON.stringify(saved_query.parsedQuery));
    var result = false;
    if (saved_query.parsedQuery.length == 1 && saved_query.parsedQuery[0].length == 0) {
        result = true;
    } else {
        result = findmatchinrow(saved_query.parsedQuery, row, columns, col_amount);
    }
    if (result) {
        let row2 = {};
        let columnnames = columns.map(e=>e.name);
        for(let i=0;i<columns.length;i++) {
            row2[columnnames[i]] = row[i];
        }
        accumulateRow(saved_query.acc_result, row, saved_query.date_col, saved_query.amount_col, row2);
    }

    return result;
}

export function getQueryAndAccFromSearch(searchQuery) {
    let parsedQuery = [];
    let accumulators = [];
    try {
        parsedQuery = booleanParser.parseBooleanQuery(searchQuery);
        accumulators = []
        parsedQuery = parsedQuery.map(e => e.map(element => {
            let arr = element.matchAll(/[a-zA-Z0-9_,.!=-]+["“”'‘’].*?["“”'‘’]|[a-zA-Z0-9_,.!:=><-]+|["“”'‘’].*?["“”'‘’]/g);
            arr = Array.from(arr).map(element => element[0].trim().replace(/["“”'‘’]/g, "").toLowerCase());
            return [...arr];
        }).flat());

        for (let i = 0; i < parsedQuery.length; i++) {
            for (let i2 = 0; i2 < parsedQuery[i].length; i2++) {
                let acc_str = "acc:";
                if (parsedQuery[i][i2].substr(0, acc_str.length) == acc_str) {
                    accumulators = accumulators.concat([...parsedQuery[i].splice(i2, 1)]);
                    i2--;
                }
            }
        }

        parsedQuery = parsedQuery.sort((a, b) => (a.length - b.length));
    } catch (err) {
        console.log(err);
        parsedQuery = [];
    }
    console.log("return"+JSON.stringify(parsedQuery)+" "+JSON.stringify(accumulators));
    return { parsedQuery, accumulators };
}

export function findmatchintable(searchQuery, rows, columns, col_amount, usesaved = 0, saved_query = {}) {
    let parsedQuery;
    let acc_result;
    let amount_col;
    let date_col;
    let accumulators = [];

    if (!usesaved) {
        ({ parsedQuery, accumulators } = getQueryAndAccFromSearch(searchQuery));
        let columnnames;

        columnnames = columns.map((e) => e.name);
        amount_col = columnnames.indexOf(col_amount);
        date_col = columnnames.indexOf("date");

        saved_query.accumulators = accumulators;
        saved_query.parsedQuery = parsedQuery;
        saved_query.amount_col = amount_col;
        saved_query.date_col = date_col;
    } else {
        accumulators = saved_query.accumulators;
        parsedQuery = saved_query.parsedQuery;
        amount_col = saved_query.amount_col;
        date_col = saved_query.date_col;
    }

    acc_result = getAccumulators(accumulators, columns);

    var result = [];
    var result2 = [];

    for (let i = 0; i < rows.length; i++) {
        var found = false;

        var row;

        if (typeof rows[i] == 'object') {
            row = [];
            for (let i2 of columns) {
                let e = rows[i][i2.name];
                e = e?.toString().toLowerCase();
                row.push(e);
            }
            
        } else {
            row = rows[i].map((element) => element?.toString().toLowerCase());
        }
        if (parsedQuery.length == 1 && parsedQuery[0].length == 0) {
            found = true;
        } else {
            found = findmatchinrow(parsedQuery, row, columns, col_amount);
        }
        if (found) {
            result.push(row);
            result2.push(rows[i]);
            accumulateRow(acc_result, row, date_col, amount_col, rows[i]);
        }
    }

    saved_query.acc_result = acc_result;

    console.log("saved_query"+JSON.stringify(saved_query));

    return {rows_matched:result, rows_matched2:result2, query:saved_query};
}

function accumulateRow(acc_result, row, date_col, amount_col, row2) {
    //for (let i of Object.keys(acc_result)) {
    for (let acc of acc_result) {
        let date = row[date_col];
        let key = row[acc.col];
        let value = Number(row[amount_col]);
        acc.add(date, key, value, row2);
    }
}

export function getAccumulators(accumulators, columns) {
    let columnnames = columns.map((e) => e.name);
    //let acc_result = {};
    let acc_result = [];

    let acc = accumulators.map((e) => {
        let elements = e.split(":");
        let sum_type = "total";
        let multiply_sign = 1;
        let periods_to_show=0;
        if (elements.length == 2) {
            sum_type = "total";
        } else if (elements.length >= 3) {
            let char = elements[2].charAt(0);
            if(char == "-" || char == "+") {
                multiply_sign = char == "-"?-1:1;
                elements[2] = elements[2].substr(1);
            }
            if (elements[2] == "d" || elements[2] == "m" || elements[2] == "y") {
                sum_type = elements[2];
            }
            if(elements.length==4) {
                periods_to_show=Number(elements[3]);
            }
        }
        const amount_columns = ["amount", "date"];

        let add = function (date, key, value, row) {
            if (amount_columns.indexOf(elements[1]) > -1) {
                key = "total";
            }
            if (this.type == "total") {
                if (!(key in this.result)) {
                    this.result[key] = value;
                } else {
                    this.result[key] += value;
                }

                if (!(key in this.result_rows)) {
                    this.result_rows[key] = [row];
                } else {
                    this.result_rows[key].push(row);
                }

            } else if (this.type == "d") {
                addDateKeyValue(this.result, date, key, value);
                addDateKeyRow(this.result_rows, date, key, row);
            } else if (this.type == "m") {
                let month = new Date(date.slice(0, 7));
                //console.log(month);
                addDateKeyValue(this.result, month.toISOString(), key, value);
                addDateKeyRow(this.result_rows, month.toISOString(), key, row);
            } else if (this.type == "y") {
                addDateKeyValue(this.result, date.slice(0, 4), key, value);
                addDateKeyRow(this.result_rows, date.slice(0, 4), key, row);
            }
        };
        if (columnnames.indexOf(elements[1]) > -1 && !acc_result.find((e)=>e.name==elements[1] && e.type==sum_type)) {
            //acc_result[elements[1]] = { name: elements[1], type: sum_type, result: {}, add: add, col:columnnames.indexOf(elements[1]) };
            acc_result.push({ name: elements[1], type: sum_type, multiply_sign: multiply_sign, periods_to_show: periods_to_show, result: {}, result_rows: {}, add: add, col: columnnames.indexOf(elements[1]) });
        }
        return { name: elements[1], type: sum_type, multiply_sign: multiply_sign, periods_to_show: periods_to_show, col: columnnames.indexOf(elements[1]) };
    }).filter(e => e.col > -1);
    return acc_result;

    function addDateKeyValue(obj, date, key, value) {
        if (!(date in obj)) {
            obj[date] = { [key]: value };
        } else {
            obj[date] =
            {
                ...obj[date],
                [key]: (obj[date][key] || 0) + value
            };
        }
    }

    function addDateKeyRow(obj, date, key, row) {
        if (!(date in obj)) {
            obj[date] = { [key]: [row] };
        } else {
            obj[date] =
            {
                ...obj[date],
                [key]: obj[date][key]? [...obj[date][key], row]:[row]//(obj[date][key] || 0) + value
            };
        }
    }

    function dateStr(date) {
        var d = new Date(date);
        str = [
            d.getFullYear().toString().slice(-2),
            ('0' + (d.getMonth() + 1)).slice(-2),
            ('0' + d.getDate()).slice(-2)
        ].join('-');
        return str;
    }
}

function findmatchinrow(parsedQuery, row, columns, col_amount) {
    for (let i = 0; i < parsedQuery?.length; i++) {
        let numFound = 0;
        for (let i1 = 0; i1 < parsedQuery[i]?.length; i1++) {
            let exp = parsedQuery[i][i1];
            let greaterthan = 0;
            let equalto = 0;
            let notequalto = 0;
            let category_filter;

            let index_g = exp.indexOf(">");
            let index_l = exp.indexOf("<");
            let index_e = exp.indexOf("=");
            if (index_g > -1) {
                greaterthan = 1;
                if (index_g > 0) {
                    category_filter = exp.split(">");
                    if (category_filter[0] == "amount") {
                        category_filter[0] = col_amount;
                    }
                }
            } else if (index_l > -1) {
                greaterthan = -1;
                if (index_l > 0) {
                    category_filter = exp.split("<");
                    if (category_filter[0] == "amount") {
                        category_filter[0] = col_amount;
                    }
                }
            } else if (exp.indexOf("!=") > -1) {
                notequalto = 1;
                category_filter = exp.split("!=");
                if (category_filter[0] == "amount") {
                    category_filter[0] = col_amount;
                }
            } else if (exp.indexOf("=") > -1) {
                equalto = 1;
                category_filter = exp.split("=");
                if (category_filter[0] == "amount") {
                    category_filter[0] = col_amount;
                }
            }

            let isFound = 0;

            for (let i2 = 0; i2 < row?.length; i2++) {
                if (columns[i2]?.display == "true" && columns[i2]?.name != "id") {
                    if (category_filter ? columns[i2]?.name == category_filter[0] : 1) {
                        if (equalto || notequalto) {
                            if (columns[i2]?.name == category_filter[0]) {
                                if (row[i2] && typeof row[i2] == 'string') {
                                    if (equalto) {
                                        if (row[i2]?.substr(0, category_filter[1].length) == category_filter[1]) {
                                            isFound++;
                                            break;
                                        }
                                    } else if (notequalto) {
                                        if (row[i2]?.substr(0, category_filter[1].length) != category_filter[1]) {
                                            isFound++;
                                            break;
                                        }
                                    }
                                }
                            }
                        }
                        else if (greaterthan == 0) {
                            if (row[i2]?.indexOf(exp) >= 0) {

                                isFound++;
                                break;
                            }
                        } else {
                            if (typeof row[i2] == "string" && row[i2].length == 0) {
                                continue;
                            }
                            if (!category_filter) {
                                let compare = parseFloat(exp.substr(1));
                                let num = Math.abs(Number(row[i2]));
                                if (!isNaN(num)) {
                                    if (greaterthan > 0 ? num >= compare : num <= compare) {
                                        isFound++;
                                        break;
                                    }
                                }
                            } else {
                                let compare;
                                let num;
                                if (category_filter[0] != "date") {
                                    compare = parseFloat(category_filter[1]);
                                    num = Math.abs(Number(row[i2]));
                                } else {
                                    compare = new Date(category_filter[1]);
                                    compare = compare.getTime();
                                    num = new Date(row[i2]);
                                    num = num.getTime();
                                }
                                if (!isNaN(num)) {
                                    if (greaterthan > 0 ? num >= compare : num <= compare) {
                                        isFound++;
                                        break;
                                    }
                                }
                            }
                        }
                    }
                }
            }
            numFound += isFound > 0 ? 1 : 0;
        }
        if (numFound == parsedQuery[i]?.length && numFound) {
            return true;
        } else {
            continue;
        }
    }
    return false;
}
