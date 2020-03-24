import React, { useEffect, useState, useRef } from "react";
import "./App.css";
import MUIDataTable from "mui-datatables";
import { Scrollbars } from "react-custom-scrollbars";
import { makeStyles } from "@material-ui/core/styles";
import AppBar from "@material-ui/core/AppBar";
import Typography from "@material-ui/core/Typography";
import Toolbar from "@material-ui/core/Toolbar";
import Button from "@material-ui/core/Button";

const useStyles = makeStyles(theme => ({
  header: {
    width: "100%",
    height: "35px",
    backgroundColor: "rgb(121, 121, 121)",
    boxShadow: "none",
    position: "fixed",
    border: "0px",
    padding: "5px 5px 5px 10px",
    alignItems: "center"
  },
  toolBar: {
    minHeight: "0px"
  },
  title: {
    flexGrow: 1,
    paddingLeft: "10px"
  }
}));

const columns = ["ID", "TEXT"];
let arrList = [];
let sendValue = [];
let sendTrId = "";
let sendType = "";

function App() {
  const classes = useStyles();
  const [sentenceList, setSentenceList] = useState([]);
  const [selected, setSelected] = useState([]);
  const [update, setUpdate] = useState(false);
  const tableDiv = useRef();

  window.mqfMapData.init(
    function() {
      if (arrList.length > 0) {
        return;
      }

      let mapDatas = window.mqfMapData.sentence;

      for (let i in mapDatas) {
        arrList.push([i, mapDatas[i].Text]);
      }

      window.parent.postMessage(
        {
          mqfEditor: {
            event: "onListMeta",
            data: { type: "sentence", value: mapDatas }
          }
        },
        "*"
      );
    },
    function(level, log) {
      window.tsPando.log.call(window.mqfMapData, level, log);
    }
  );

  useEffect(() => {
    if (sentenceList.length > 0) {
      return;
    }
    window.addEventListener(
      "message",
      function(ev) {
        if (ev.data && ev.data.mqfEditor) {
          var event = ev.data.mqfEditor.event;
          var data = ev.data.mqfEditor.data;

          if (event === "edit") {
            let value = data.value[0].value;

            if (!value) {
              return;
            }

            sendTrId = data.value[0].data;

            let count = value[0].length;
            let number = [];

            for (let i = 0; i < arrList.length; i++) {
              if (value.indexOf(arrList[i][0]) > -1) {
                count--;
                number.push(i);
                if (count === 0) {
                  break;
                }
              }
            }
            setSelected(number);
            //setUpdate(true);
            window.parent.postMessage(
              { mqfEditor: { event: "showButton", data: "sentence" } },
              "*"
            );
          } else if (event === "reset") {
            setSelected("");
            setSentenceList(arrList);
          }

          if (tableDiv.current) {
            tableDiv.current.childNodes[0].style.boxShadow = "none";
          }

          setSentenceList(arrList);
        }
      },
      false
    );
  });

  const onSelectSentences = (rows, all) => {
    sendValue = [];
    rows.forEach(function(item) {
      sendValue.push(all[item.index].data[0]);
    });
  };

  const options = {
    filterType: "checkbox",
    filter: false,
    print: false,
    download: false,
    selectableRowsOnClick: true,
    disableToolbarSelect: true,
    rowsSelected: selected,
    responsive: "stacked",
    viewColumns: false,
    onTableChange: (action, tableState) => {
      if (action === "rowsSelect") {
        onSelectSentences(tableState.selectedRows.data, tableState.data);
      }
    },
    customToolbar: () => (
      <Button size="large" color="primary" onClick={onClickSet}>
        Set
      </Button>
    )
  };

  const onClickSet = () => {
    //  Asset과 달리, 주제는 Mandatory Field가 아니므로 값이 없어도 그대로 전송함
    window.parent.postMessage(
      {
        mqfEditor: {
          event: "onSetMeta",
          data: {
            target: "sentenceManager",
            trId: sendTrId,
            type: sendType,
            value: sendValue.length ? sendValue : undefined
          }
        }
      },
      "*"
    );
  };

  return (
    <>
      <AppBar className={classes.header}>
        <Toolbar className={classes.toolBar}>
          <Typography className={classes.title}>
            PANDO - SENTENCE MANAGER
          </Typography>
        </Toolbar>
      </AppBar>
      <Scrollbars
        style={{ top: "35px", height: "calc(100% - 85px)", zIndex: 1 }}
      >
        {sentenceList.length > 0 && selected.length > 0 && (
          <div style={{ width: "calc(100% - 15px)" }} ref={tableDiv}>
            <MUIDataTable
              title={"SENTENCE LIST"}
              data={sentenceList}
              columns={columns}
              options={options}
            />
          </div>
        )}
      </Scrollbars>
    </>
  );
}

export default App;
