import React from "react";
import MUIDataTable, { debounceSearchRender } from "mui-datatables";
import { makeStyles } from "@material-ui/core/styles";
import { reducearray } from "../../helpers/utils";
import { findmatchintable, findmatches3 } from "../../helpers/filtermatches";

const useStyles = makeStyles((theme) => ({
  alignrightHeader: {
    "& span": {
      display: "flex",
      justifyContent: "flex-end",
    },
  },
}));

const NewTable = (props) => {
  var data = props.data;
  var setSearchData = props.set_search_data;
  var cols = props.cols;
  var setAccResult = props.set_acc_result;

  const classes = useStyles();

  var options = {
    filterType: "checkbox",
    resizableColumns: true,
    searchOpen: "searchOpen" in props ? props.searchOpen : true,
    response: "standard",
    ...("elevation" in props && { elevation: props.elevation }),
    print: false,
    draggableColumns: { enabled: true },
    selectableRows: "multiple",
    selectableRowsHideCheckboxes: true,
    selectableRowsOnClick: false,
    rowsPerPage: 100,
    selectToolbarPlacement: "above",
    customSearchRender: debounceSearchRender(500),
    onTableInit: (action, tableState) => {
      if (setSearchData) {
        var search_data = tableState.displayData.map((element) => {
          return {
            x: data[element.dataIndex][cols.x],
            y: data[element.dataIndex][cols.y],
          };
        });
        const res = reducearray(
          search_data,
          (txdata) => txdata.x,
          (txdata) => txdata.y,
          (acc, value) => acc + value
        );
        const tabledata = res
          .map((element) => {
            var resp = {
              x: element.key,
              y: element.value.total,
              time: new Date(element.key).getTime(),
            };
            if (cols.category) {
              resp.category = cols.category;
            }
            return resp;
          })
          .sort((a, b) => a.time - b.time);
        setSearchData(tabledata);
      }
    },
    onTableChange: (action, tableState) => {
      if (
        action == "search" ||
        action == "filterChange" ||
        action == "resetFilters" ||
        action == "propsUpdate" /* || redraw == 1 */
      ) {
        if (setSearchData) {
          var search_data = tableState.displayData.map((element) => {
            return {
              x: data[element.dataIndex][cols.x],
              y: data[element.dataIndex][cols.y],
            };
          });
          const res = reducearray(
            search_data,
            (txdata) => txdata.x,
            (txdata) => txdata.y,
            (acc, value) => acc + value
          );
          const tabledata = res
            .map((element) => {
              var resp = {
                x: element.key,
                y: element.value.total,
                time: new Date(element.key).getTime(),
              };
              if (cols.category) {
                resp.category = cols.category;
              }
              return resp;
            })
            .sort((a, b) => a.time - b.time);

          setSearchData(tabledata);
        }
        if (action == "search" || action == "propsUpdate") {
          if ("acc_result" in saved_query) {
            if (action == "propsUpdate") {
              //let rows = tableState.displayData.map((e) => e.data);
              findmatchintable(
                saved_query.searchQuery,
                data,
                tableState.columns,
                "amount_in_base_currency",
                1,
                saved_query
              );
            }
            //for (let i of Object.keys(saved_query.acc_result)) {
            //}
            if (setAccResult) {
              setAccResult(saved_query.acc_result);
            }
          }
        }
      }
    },
    customSearch: (searchQuery, currentRow, columns) => {
      let rows = currentRow.map((element) => element?.toString().toLowerCase());
      return findmatches3(
        searchQuery.trim(),
        rows,
        columns,
        "amount_in_base_currency",
        saved_query
      );
    },
  };

  let columns = [];
  var columnorder = [];
  if (data) {
    columns = Object.keys(data[0]).map((element) => {
      return { name: element, options: { display: false } };
    });

    //const show = ["date","overall_unrealized_cost_base_ccy"];
    const show = cols?.show;
    show?.forEach((element) => {
      columnorder.push(Object.keys(data[0])?.indexOf(element));
    });
    columns.forEach((element) => {
      if (show.indexOf(element.name) > -1) {
        element.options.display = true;
      }
      //if (element.name == "date")
      //    columnorder = [columns.indexOf(element), ...columnorder];
      else {
        columnorder.push(columns.indexOf(element));
      }

      //if (element.name == "amount")
      if (typeof data[0][element.name] === "number") {
        element.options.customBodyRenderLite = (dataIndex, rowIndex) =>
          data[dataIndex][element.name].toLocaleString("en-US", {
            minimumFractionDigits: 2,
          });
        element.options.setCellProps = (value) => ({
          style: { textAlign: "right" },
        });
        element.options.setCellHeaderProps = (value) => ({
          className: classes.alignrightHeader,
        });
      }

      if (typeof data[0][element.name] === "boolean") {
        element.options.customBodyRenderLite = (dataIndex, rowIndex) =>
          data[dataIndex][element.name] ? "true" : "false";
      }

      if (cols.custom && Object.keys(cols.custom).indexOf(element.name) > -1) {
        element.options = { ...element.options, ...cols.custom[element.name] };
        if ("customBodyRenderLite" in element.options) {
          delete element.options.customBodyRenderLite;
        }
      }
    });

    options.columnOrder = columnorder;
    if (props.responsive) {
      options.responsive = props.responsive;
    }

    if (columns.find((e) => e.name == "date")) {
      options.sortOrder = {
        name: "date",
        direction: "desc",
      };
    }
  }

  return (
    <div>
      <MUIDataTable
        title={"Employee List"}
        data={data}
        columns={columns}
        options={options}
        {...props.aProps}
        style={props.style}
      />
    </div>
  );
};

export default NewTable;

var saved_query = { searchQuery: null, parsedQuery: null };
