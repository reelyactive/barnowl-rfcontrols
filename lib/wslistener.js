/**
 * Copyright reelyActive 2022
 * We believe in an open Internet of Things
 */


const StompJs = require('@stomp/stompjs');

// stomp-js requires WebSocket as a global, see:
// https://stomp-js.github.io/guide/stompjs/rx-stomp/ng2-stompjs/pollyfils-for-stompjs-v5.html#ws
Object.assign(global, { WebSocket: require('ws') });


const DEFAULT_RFC_OS_URL = 'ws://localhost/websockets/messaging';
const DEFAULT_REGION_IDS = [];
const TOPIC_TAGBLINKLITE = '/topic/tagBlinkLite';


/**
 * WsListener Class
 * Listens for RFC OS data via STOMP over WebSocket.
 */
class WsListener {

  /**
   * WsListener constructor
   * @param {Object} options The options as a JSON object.
   * @constructor
   */
  constructor(options) {
    let self = this;
    options = options || {};
    options.url = options.url || DEFAULT_RFC_OS_URL;

    this.decoder = options.decoder;
    this.regionIds = options.regionIds || DEFAULT_REGION_IDS;
    this.decodingOptions = options.decodingOptions || {};

    self.client = new StompJs.Client({ brokerURL: options.url });
    handleConnections(self);
    self.client.activate();
  }

}


/**
 * Handle WebSocket connections.
 * @param {WsListener} instance The WsListener instance.
 */
function handleConnections(instance) {
  instance.client.onConnect = function(frame) {
    console.log('RF Controls WebSocket connection established');

    // Subscribe to topics
    instance.regionIds.forEach((regionId) => {
      let topic = TOPIC_TAGBLINKLITE + '.' + regionId;
      instance.client.subscribe(topic, (message) => {
        let tagEvent = JSON.parse(message.body);
        instance.decoder.handleData(tagEvent, regionId, Date.now(),
                                    instance.decodingOptions);
      });
    });
  };

  instance.client.onStompError = function(frame) {
    console.log('barnowl-rfcontrols WebSocket error: ' +
                frame.headers['message']);
  };
}


module.exports = WsListener;
