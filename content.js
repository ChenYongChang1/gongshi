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

// ones-layout-content

chrome.runtime.onMessage.addListener((info, sender, sendResponse) => {
  if (info.type === "getlist") {
    setTimeout(() => {
      const data = getData();
      sendMessage({ type: "data", data });
    }, 1000);
  }
  return true;
});

// setTimeout(() => {
//   sendMessage({ type: "load" });
// }, 1000);
