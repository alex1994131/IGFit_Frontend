import React, {useState, useEffect} from 'react';
import * as AntChart from '@ant-design/charts';
import { txdata2 } from "./txdata.js";
 
async function getTotal() {
  var url = "https://api.pocketsmith.com/v2/users/162199/transactions";
  var options = {headers: {"x-developer-key": "981081937f8f6098257c0e2619de68639a87852eb8f51d5db1e8dd00a3c24e3e342ee7902c2a0f0dff518de06c4c6ab3e10a62ec5bc761a1643cc027952da3f0","Accept":"application/json",'Content-Type': 'application/json;charset=UTF-8'}};
  //var response = await fetch(url, options);
  //var responsetext = response.getContentText();
  // var headers = response.headers;
  // console.log("fetching");
  // var total = response.headers.get("total");
  // var tx = await response.json();
  // var txstr = JSON.stringify(tx);
  var tx = txdata2;
  var data = [];
  tx.forEach(txdata=>{
    var point = {x: new Date(txdata["date"]), y: txdata["amount"]};
    data.push(point);
  });
  // const res = Array.from(data.reduce(
  //   (m, {x, y}) => m.set(x.getTime(), (m.get(x.getTime()) || 0) + y), new Map
  // ), ([x, y]) => ({x: new Date(x), y}));
  //const res = reducearray(tx);
  const res = reducearray(tx,(txdata)=>new Date(txdata["date"]).getTime(), (txdata)=>txdata["amount"],(acc,value)=>acc+value);
  //const res = reducearray(tx,(txdata)=>txdata.category.title, (txdata)=>txdata["amount"],(acc,value)=>acc+value);
 
  return res.map((element)=>{return {x:new Date(element.key),y:(element.value.total)}});
}

function reducearray(tx, getkey, getvalue, sumvalue) {
  //var tx_new = tx.map((txdata) => { return { date: new Date(txdata["date"]).getTime(), data: { value: txdata["amount"], data: [txdata] } } });
  var tx_new = tx.map((txdata) => { return { key: getkey(txdata), value: { total: getvalue(txdata), data: [txdata] } } });
  
  const res = Array.from(tx_new.reduce(
      (m, { key, value }) => { 
      
          console.log(m.get(key)?m.get(key).total:0);
      return m.set(key, { total:sumvalue((m.get(key)?.total || 0), value.total), data:m.get(key)?[...m.get(key).data,value.data[0]]:value.data })}, new Map
  ), ([key, value]) => ({ key, value }));
  return res;
}

JSON.flatten = function(data) {
  var result = {};
  function recurse (cur, prop) {
      if (Object(cur) !== cur) {
          result[prop] = cur;
      } else if (Array.isArray(cur)) {
           for(var i=0, l=cur.length; i<l; i++)
               recurse(cur[i], prop + "[" + i + "]");
          if (l == 0)
              result[prop] = [];
      } else {
          var isEmpty = true;
          for (var p in cur) {
              isEmpty = false;
              recurse(cur[p], prop ? prop+"."+p : p);
          }
          if (isEmpty && prop)
              result[prop] = {};
      }
  }
  recurse(data, "");
  return result;
};

// function FetchAllTransactions() {
//   var jsondata = new Array();
//   var jsondatatext = new Array();
  
//   var pages = Math.ceil(getTotal()/100);
  
//   var header = {headers: {"x-developer-key": "981081937f8f6098257c0e2619de68639a87852eb8f51d5db1e8dd00a3c24e3e342ee7902c2a0f0dff518de06c4c6ab3e10a62ec5bc761a1643cc027952da3f0","accept":"application/json"}};
  
//   for(var i=0;i<pages;i++) {
//     var url = "https://api.pocketsmith.com/v2/users/162199/transactions?per_page=100&page="+(i+1);
//     var response = UrlFetchApp.fetch(url, header);
//     var responsetext = response.getContentText();
//     //var headers = response.getAllHeaders();
//     //var jsondata = JSON.parse(response.getContentText());
//     jsondata = jsondata.concat(JSON.parse(responsetext));
//   }
  
//   var sheet = "Tx";
//   var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
//   var sheet = ss.getSheetByName(sheet);
  
//   for(j=0;j<jsondata.length;j++) {
//     //setDataValue("Tx",j+1,1,JSON.stringify(jsondata[j]));
//     jsondatatext.push([JSON.stringify(jsondata[j])]);
//   }
  
//   var txa = jsondatatext[0];
//   Logger.log(jsondatatext[0]);
//   sheet.getRange(1,1,jsondatatext.length,jsondatatext[0].length).setValues(jsondatatext);
//   SpreadsheetApp.flush();
// }

const App = () => {
  // Generating some dummy data

  const [data, setData] = useState([{x:0,y:0}]);
  const [fetch, setFetch] = useState(0);
  // const myData = [
  //   { x: 0, y: data },
  //   { x: 1, y: data },
  //   { x: 2, y: data },
  //   { x: 3, y: data },
  //   { x: 4, y: data },
  //   { x: 5, y: data },
  //   { x: 6, y: data },
  //   { x: 7, y: data },
  //   { x: 8, y: data },
  // ];
  useEffect(() => {
    const fetchData = async () => {
        if(!fetch) {
        const data = await getTotal();
        setData(data);
        setFetch(1);
        }
    };

    fetchData();
});

var config = {
  //appendPadding: 100,
  data: data,
  xField: 'x',
  yField: 'y',
  // angleField: 'y',
  //   colorField: 'x',
  //   radius: 0.9,
  label: {
      position: 'center',
      style: {
          fill: '#000000',
          opacity: 1.0,
      },
      //offset: -10,
       formatter: ({ y }) => `${(y).toFixed(1)}`
  },
  // label: {
  //   type: 'outer',
  //   offset: '+30%',
  //   //content: '{name}',
  //   // style: {
  //   //   fontSize: 14,
  //   //   textAlign: 'center',
  //   // },
  //   formatter: ({ y }) => `${(y).toFixed(1)}`
  // },
  meta: {
      type: { alias: '类别' },
      sales: { alias: '销售额' }
  },
  xAxis: {
    type: "timeCat"
  },
  tooltip: {
    fields: ['y'],
    formatter: (datum) => {return {name:config.yField, value:datum.y.toFixed(1)}}
  }
};

if(fetch)
  return (
    <>
      <AntChart.Column
        {...config}
      />
    </>
  );
  else
  return <>Loading...</>;
};

export default App;