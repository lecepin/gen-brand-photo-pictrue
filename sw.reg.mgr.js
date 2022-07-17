(function () {
    register({
      ver: 2,
      path: ".",
      name: "sw.js",
      onUpdate: () => {},
      onSuccess: () => {},
    });
  
    function register(config) {
      if ("serviceWorker" in navigator) {
        var swUrl = config.path + "/" + config.name + "?v=" + config.ver;
        navigator.serviceWorker
          .register(swUrl)
          .then((swReg) => {
            config.log && console.log("Service Worker 注册成功。", swReg);
            if (config && config.onRegster) {
              config.onRegister(swReg);
            }
  
            swReg.onupdatefound = () => {
              var installingWorker = swReg.installing;
              if (installingWorker == null) {
                return;
              }
              installingWorker.onstatechange = () => {
                if (installingWorker.state === "installed") {
                  if (navigator.serviceWorker.controller) {
                    config.log && console.log("Service Worker 已安装更新。");
                    if (config && config.onUpdate) {
                      config.onUpdate(swReg);
                    }
                  } else {
                    config.log && console.log("Service Worker 已安装。");
                    if (config && config.onSuccess) {
                      config.onSuccess(swReg);
                    }
                  }
                }
              };
            };
          })
          .catch((err) => {
            if (config && config.onError) {
              config.onError(err);
            }
            console.error("serviceWorker注册期间发生错误:", error);
          });
      }
    }
  
    function unregister() {
      if ("serviceWorker" in navigator) {
        navigator.serviceWorker.ready.then((swReg) => {
          swReg.unregister((result) => {
            result && console.log("Service Worker 注销成功");
          });
        });
      }
    }
  })();