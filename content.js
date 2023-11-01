const sendMessage = (sendInfo) => {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage(sendInfo, (...args) => {
      resolve(...args);
      return true;
    });
  });
};
function getData() {
  var dateList = Array.from(
    document.querySelector(
      "body > div.container > div > div > div > section > section > main > div > div.workspace-manhour > div > div.ones-layout-top-main-full-main.ManHourReportContent-Container > div:nth-child(1) > div > div.fixedDataTableLayout_rowsContainer > div.fixedDataTableRowLayout_rowWrapper > div > div.fixedDataTableRowLayout_body > div:nth-child(2)"
    ).childNodes
  );
  dateList = dateList.map((item) => {
    const date = item.querySelector(
      ".column-cell-date-header-content-bottom"
    ).textContent;
    const [mon, day] = date.split("/");
    return `2023-${mon}-${day}`;
  });
  var all = Array.from(
    document.querySelector(
      "body > div.container > div > div > div > section > section > main > div > div.workspace-manhour > div > div.ones-layout-top-main-full-main.ManHourReportContent-Container > div:nth-child(1) > div > div.fixedDataTableLayout_rowsContainer > div:nth-child(2)"
    ).childNodes
  ).map((item, index) => {
    const p = item.querySelector(
      ".fixedDataTableCellGroupLayout_cellGroup"
    ).parentNode;
    const all = p.childNodes;
    const first = all[0];
    const titleDom = first.querySelector('div[role="presentation"]');
    const title = titleDom.getAttribute("title");
    const next = Array.from(all[1].childNodes).map((citem, cindex) => {
      return [parseFloat(citem.textContent) || 0, dateList[cindex], title];
    });
    return next;
  });
  var mergeData = all.reduce((data, item) => {
    if (!data.length)
      return item.map(([t, d, c]) => (t ? [t, d, c] : [t, d, ""]));
    item.forEach(([t, d, c], index) => {
      if (t) {
        data[index][0] += t;
        data[index][2] += (data[index][2] ? "；" : "") + c;
      }
    });
    return data;
  }, []);

  var filterData = mergeData.filter((i) => i[0]);
  return filterData;
}

// const url =
//  "http://oa.xiaoi.com:9080/seeyon/collaboration/collaboration.do?method=newColl&from=templateNewColl&templateId=16777271696550";

// http://oa.xiaoi.com:9080/seeyon/collaboration/collaboration.do?method=newColl&from=templateNewColl&templateId=16908784365880

function sendToOaMessage({ time, gongshi, content, url }) {
  return new Promise((resolve) => {
    const ad = window.open(url, "_blank");
    ad.onload = () => {
      const tD = ad.top.document;
      var a = tD.querySelector("#zwIframe");
      var d = a.contentWindow.document;
      function onblur(dom) {
        dom && dom.onblur(dom);
      }

      // d.querySelector("#field0014").focus();
      var gs = d.querySelector("#field0014");
      var cont = d.querySelector("#field0015");
      var tim = d.querySelector("#field0009");

      gs.focus();
      gs.value = gongshi;
      gs.blur();

      cont.focus();
      cont.value = content;
      cont.blur();

      tim.focus();
      tim.value = time;
      tim.blur();

      setTimeout(() => {
        onblur(gs);
      }, 100);
      setTimeout(() => {
        onblur(cont);
      }, 200);
      setTimeout(() => {
        onblur(tim);
      }, 300);

      setTimeout(() => {
        // console.log(send)
        // send && send.click();
        resolve(ad);
        setTimeout(() => {
          resolve(ad);
        }, 1000);
      }, 3000);
    };
  });
}

//  list.forEach((item) => {
//   sendMessage(item);
//  });
async function startOpenOa(list) {
  while (list.length) {
    const temp = list.shift();
    const win = await sendToOaMessage(temp);
    // win.close();
    // const temp = list.splice(0, 1);
    // const excuteArr = [];
    // for (const i of temp) {
    //   excuteArr.push(sendToOaMessage(i));
    // }
    // await Promise.all(excuteArr);
  }
}
// ones-layout-content

chrome.runtime.onMessage.addListener((info, sender, sendResponse) => {
  if (info.type === "getlist") {
    setTimeout(() => {
      const data = getData();
      sendMessage({ type: "data", data });
    }, 1000);
  } else if (info.type === "oa") {
    startOpenOa(info.data);
  }
  return true;
});

// setTimeout(() => {
//   sendMessage({ type: "load" });
// }, 1000);
