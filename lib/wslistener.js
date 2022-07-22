/**
 * Copyright reelyActive 2022
 * We believe in an open Internet of Things
 */


const StompJs = require('@stomp/stompjs');

// stomp-js requires WebSocket as a global, see:
// https://stomp-js.github.io/guide/stompjs/rx-stomp/ng2-stompjs/pollyfils-for-stompjs-v5.html#ws
Object.assign(global, { WebSocket: require('ws') });


const DEFAULT_RFC_OS_URL = 'ws://localhost:61613/websockets/messaging';
const DEFAULT_USERNAME = 'admin';
const DEFAULT_PASSWORD = 'admin';
const DEFAULT_RECONNECT_MILLISECONDS = 5000;
const DEFAULT_HEARTBEAT_MILLISECONDS = 10000;
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
    options.username = options.username || DEFAULT_USERNAME;
    options.password = options.password || DEFAULT_PASSWORD;

    this.decoder = options.decoder;
    this.regionIds = options.regionIds || DEFAULT_REGION_IDS;
    this.decodingOptions = options.decodingOptions || {};

    self.client = new StompJs.Client({
        brokerURL: options.url,
        connectHeaders: { login: options.username, passcode: options.password },
        reconnectDelay: DEFAULT_RECONNECT_MILLISECONDS,
        heartbeatIncoming: DEFAULT_HEARTBEAT_MILLISECONDS,
        heartbeatOutgoing: DEFAULT_HEARTBEAT_MILLISECONDS,
        onConnect: (frame) => { handleConnection(self); },
        onStompError: handleError
    });

    if(options.isDebug) {
      self.client.debug = (message) => { console.log(message); };
    }

    self.client.activate();
  }

}


/**
 * Handle WebSocket connection.
 * @param {WsListener} instance The WsListener instance.
 */
function handleConnection(instance) {
  console.log('barnowl-rfcontrols: STOMP WebSocket connection established');

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


/**
 * Handle WebSocket error.
 * @param {Object} frame The STOMP frame.
 */
function handleError(frame) {
  console.log('barnowl-rfcontrols STOMP error: ' + frame.headers['message']);
};


module.exports = WsListener;
