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
const opentab = async () => {
  const res = await chrome.tabs.create({
    url: "http://172.18.208.76/project/#/workspace/team/L5bhWkYr/manhour",
  });

  const { windowId, pendingUrl, url } = res;
  const tab = await queryTabIsEnding({ url: url || pendingUrl });
  if (tab && tab.id) {
    sendTabMessage(tab.id, { type: "getlist" });
  }
  // console.log(res, "res");
};

chrome.runtime.onMessage.addListener((info, sender, ev) => {
  if (info.type === "data") {
    console.log(info.data);
    //   ev({ type: "getlist" });
  }
  return true;
});
this.opentab = opentab;
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
