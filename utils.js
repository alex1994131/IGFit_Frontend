import { useRef, useState, useEffect } from "react";

export function reducearray(tx, getkey, getvalue, sumvalue) {
    //var tx_new = tx.map((txdata) => { return { date: new Date(txdata["date"]).getTime(), data: { value: txdata["amount"], data: [txdata] } } });
    var tx_new = tx.map((txdata) => { return { key: getkey(txdata), value: { total: getvalue(txdata), data: [txdata] } }; });

    const res = Array.from(tx_new.reduce(
        (m, { key, value }) => {

            //console.log(m.get(key) ? m.get(key).total : 0);
            return m.set(key, { total: sumvalue((m.get(key)?.total || 0), value.total), data: m.get(key) ? [...m.get(key).data, value.data[0]] : value.data });
        }, new Map
    ), ([key, value]) => ({ key, value }));
    return res;
}

JSON.flatten = function (data) {
    var result = {};
    function recurse(cur, prop) {
        if (Object(cur) !== cur) {
            result[prop] = cur;
        } else if (Array.isArray(cur)) {
            for (var i = 0, l = cur.length; i < l; i++)
                recurse(cur[i], prop + "[" + i + "]");
            if (l == 0)
                result[prop] = [];
        } else {
            var isEmpty = true;
            for (var p in cur) {
                isEmpty = false;
                recurse(cur[p], prop ? prop + "." + p : p);
            }
            if (isEmpty && prop)
                result[prop] = {};
        }
    }
    recurse(data, "");
    return result;
};

export function formatDate(date) {
    var monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    var day = date.getDate();
    var monthIndex = date.getMonth();
    var year = date.getFullYear();

    return monthNames[monthIndex] + '-' + ''.concat(year).substr(2);
}

export function dateStr(date) {
    var d = new Date(date);
    let str = [
        d.getFullYear().toString().slice(0),
        ('0' + (d.getMonth() + 1)).slice(-2),
        ('0' + d.getDate()).slice(-2)
    ].join('-');
    return str;
}

export const formatter_commas = function (v) {
    return ''.concat(v).replace(/\d{1,3}(?=(\d{3})+$)/g, function (s) {
        return ''.concat(s, ',');
    });
};
function toTitleCase(str) {
    return str.replace(/\w\S*/g, function (txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
}
export function shorten(str, length) {
    if (str?.length > length) {
        return str.substr(0, length) + "...";
    }
    return str;
}

export function debounce(func, wait, immediate) {
    var timeout = useRef();
    return function() {
      var context = this,
        args = arguments;
      var later = function() {
        timeout.current = null;
        if (!immediate) func.apply(context, args);
      };
      var callNow = immediate && !(timeout.current);
      clearTimeout(timeout.current);
      timeout.current = setTimeout(later, wait);
      if (callNow) func.apply(context, args);
    };
}

/**
 * Custom hook that tells you whether a given media query is active.
 *
 * Inspired by https://usehooks.com/useMedia/
 * https://gist.github.com/gragland/ed8cac563f5df71d78f4a1fefa8c5633
 */
export function useMediaQuery(query) {
    const [matches, setMatches] = useState(false);
    useEffect(
      () => {
        const mediaQuery = window.matchMedia(query);
        setMatches(mediaQuery.matches);
        const handler = (event) => setMatches(event.matches);
        mediaQuery.addEventListener("change", handler);
        return () => mediaQuery.removeEventListener("change", handler);
      },
      [] // Empty array ensures effect is only run on mount and unmount
    );
    return matches;
  }
  
  export function useBreakpoints() {
      const breakpoints = {
        isSs: useMediaQuery("(max-width: 550px)"),
        isXs: useMediaQuery("(min-width: 551px) and (max-width: 640px)"),
        isSm: useMediaQuery("(min-width: 641px) and (max-width: 768px)"),
        isMd: useMediaQuery("(min-width: 769px) and (max-width: 1024px)"),
        isLg: useMediaQuery("(min-width: 1025px)"),
        active: "ss"
      };
      if (breakpoints.isSs) breakpoints.active = "ss";
      if (breakpoints.isXs) breakpoints.active = "xs";
      if (breakpoints.isSm) breakpoints.active = "sm";
      if (breakpoints.isMd) breakpoints.active = "md";
      if (breakpoints.isLg) breakpoints.active = "lg";
      return breakpoints;
    }

export function Responsive(breakpoints,x,y) {
    // console.log("breakpoint retunrning "+(!(breakpoints.isSs || breakpoints.isXs) ?x:(y?y:x)))
    console.log(breakpoints);
    return !(breakpoints.isSs || breakpoints.isXs) ?x:(y?y:x);
}

export function getCol(col_name, row, columns) {
    let column = columns.indexOf(col_name);
    if(column>-1) {
        let value = row[column];
        return value;
    }

    return null;
}

export function sumif(data, cb) {
    let result = 0;
    for (let i = 0; i < data.length; i++) {
        result += cb(data[i]);
    }
    return result;
}