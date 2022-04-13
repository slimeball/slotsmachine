import UTILS from './utils';
export default {
  // pwa
  closeApp() {
    if (window && window.parent) {
      window.parent.postMessage(
        {
          type: "goBack",
        },
        "*"
      );
    }
    // rn
    if (window && window.postMessage && UTILS.getUrlKey('isRn') == 1) {
      window.postMessage(
        JSON.stringify({
          type: "returnback",
        })
      );
    }
    // native
    if (window.webkit && window.webkit.messageHandlers) {
      window.webkit.messageHandlers.returnback.postMessage({});
    }
    if (window.AndroidClient) {
      window.AndroidClient.backToHome();
    }
  },
}