const tempIdMap = {
  "RPA-大模型落地项目": "16777271696550",
  "RD106 - 数据&大模型": "16908784365880",
};

const sendTabMessage = (tabId, sendInfo) => {
  return new Promise((resolve) => {
    chrome.tabs.sendMessage(tabId, sendInfo, (...args) => {
      resolve(...args);
      return true;
    });
  });
};
const changeSize = (windowId, { width, height }) => {
  return new Promise((resolve) => {
    chrome.windows.update(windowId, { width, height }, () => {
      resolve();
    });
  });
};
const queryTab = (query, resolve) => {
  setTimeout(() => {
    const url = query.url;
    chrome.tabs.query({}, (tabs) => {
      const tab = tabs.find((item) => item.url === url);
      console.log(tabs, tab);
      if (tab && tab.status === "complete") {
        resolve(tab);
      } else {
        return queryTab(query, resolve);
      }
    });
  }, 500);
};
const queryTabIsEnding = async (query) => {
  return await new Promise((resolve) => {
    queryTab(query, resolve);
  });
};
const opentab = async (createUrl) => {
  const res = await chrome.tabs.create({
    url: createUrl,
  });

  const { windowId, pendingUrl, url } = res;
  const tab = await queryTabIsEnding({ url: url || pendingUrl });
  return tab;
  // console.log(res, "res");
};

const openOnesTab = async () => {
  const tab = await opentab(
    "http://172.18.208.76/project/#/workspace/team/L5bhWkYr/manhour"
  );
  if (tab && tab.id) {
    sendTabMessage(tab.id, { type: "getlist" });
  }
  // console.log(res, "res");
};
const getOaData = (list) => {
  return list.map((item) => {
    console.log(item, "item");
    let tempId = "";
    let fcontent = "";
    tempId = tempIdMap[item[3][0]];
    if (item[2].split("；").length === Array.from(new Set(item[3])).length) {
      fcontent = item[2];
    } else {
      const cArr = item[2].split("；");
      const projectName = item[3][0];
      item[3].forEach((citem, cindex) => {
        if (citem === projectName) {
          fcontent += cArr[cindex];
          if (
            cindex !== item[3].length - 1 &&
            cindex !== item[3].lastIndexOf(projectName)
          ) {
            fcontent += ";";
          }
        }
      });
    }
    return {
      time: item[1],
      gongshi: item[0],
      content: fcontent,
      url: `http://oa.xiaoi.com:9080/seeyon/collaboration/collaboration.do?method=newColl&from=templateNewColl&templateId=${tempId}`,
    };
  });
};

chrome.runtime.onMessage.addListener(async (info, sender, ev) => {
  if (info.type === "data") {
    console.log(info.data);
    const oaList = getOaData(info.data);
    //   ev({ type: "getlist" });
    const tab = await opentab(
      "http://oa.xiaoi.com:9080/seeyon/main.do?method=main"
    );
    //
    setTimeout(() => {
      sendTabMessage(tab.id, { type: "oa", data: oaList });
    }, 500);
  }
  return true;
});

this.openOnesTab = openOnesTab;
// addListerMessage(call: NotResponseCall) {
//   const linstener = (...args: any) => {
//     call(...args)

//     return true
//   }
//   const hasListener = chrome.runtime.onMessage.hasListeners()
//   if (!hasListener) {
//     chrome.runtime.onMessage.addListener(linstener)
//   }

//   return () => {
//     rpaChrome.removeListerMessage(linstener)
//   }
// },
// removeListerMessage(call: NotResponseCall) {
//   return chrome.runtime.onMessage.removeListener(call)
// },
// sendTabMessage<T = any, R = any>(tabId: number, sendInfo: T, call = (response: R): any => '') {
//   return chrome.tabs.sendMessage<T>(tabId, sendInfo, (...args) => {
//     call(...args)
//     return true
//   })
// },
// sendMessage<T = any, R = any>(sendInfo: T, call = (response: R): any => '') {
//   return chrome.runtime.sendMessage(sendInfo, (...args) => {
//     call(...args)
//     return true
//   })
// },
