/**
 * Copyright reelyActive 2022
 * We believe in an open Internet of Things
 */


const stompit = require('stompit');


const DEFAULT_HOST = 'localhost';
const DEFAULT_PORT = 61613;
const DEFAULT_USERNAME = 'admin';
const DEFAULT_PASSWORD = 'admin';
const DEFAULT_HEARTBEATS = '5000,5000';
const DEFAULT_ACK = 'client-individual';
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
    options.host = options.host || DEFAULT_HOST;
    options.port = options.port || DEFAULT_PORT;
    options.username = options.username || DEFAULT_USERNAME;
    options.password = options.password || DEFAULT_PASSWORD;

    this.decoder = options.decoder;
    this.regionIds = options.regionIds || DEFAULT_REGION_IDS;
    this.decodingOptions = options.decodingOptions || {};

    let headers = {
        host: "/",
        login: options.username,
        passcode: options.password,
        "heart-beat": DEFAULT_HEARTBEATS
    };
    let server = {
        host: options.host,
        port: options.port,
        connectHeaders: headers
    };

    this.manager = new stompit.ConnectFailover([ server ]);
    this.manager.connect((error, client, reconnect) => {
      handleConnection(error, client, reconnect, self);
    });
  }

}


/**
 * Handle WebSocket connection.
 * @param {Object} error The stompit error, if any.
 * @param {Object} client The stompit client.
 * @param {Function} reconnect The reconnect function to call.
 * @param {WsListener} instance The WsListener instance.
 */
function handleConnection(error, client, reconnect, instance) {

  // Terminal error
  if(error) {
    return handleError(error.message, true);
  }
  else {
    console.log('barnowl-rfcontrols: STOMP WebSocket connection established');
  }

  // Non-terminal error: attempt reconnection
  client.on('error', (error) => {
    handleError(error.message, false);   
    reconnect();
  });

  // Subscribe to region IDs
  instance.regionIds.forEach((regionId) => {
    handleSubscription(client, regionId, instance);
  });
};


/**
 * Handle STOMP topic subscription.
 * @param {Object} client The stomp client.
 * @param {String} regionId The regionId on which to subscribe.
 * @param {WsListener} instance The WsListener instance.
 */
function handleSubscription(client, regionId, instance) {
  let destination = TOPIC_TAGBLINKLITE + '.' + regionId;
  let headers = { destination: destination, ack: DEFAULT_ACK };

  client.subscribe(headers, (error, message) => {
    if(error) {
      handleError(error.message, false);
    }
    else {
      message.readString('utf-8', (error, body) => {
        if(error) {
          handleError(error.message, false);
        }
        else {
          let tagEvent = JSON.parse(body);
          instance.decoder.handleData(tagEvent, regionId, Date.now(),
                                      instance.decodingOptions);
          client.ack(message);
        }
      });
    }
  });
}


/**
 * Handle STOMP WebSocket error.
 * @param {String} message The error message.
 * @param {boolean} isTerminating Whether the error is terminal or not.
 */
function handleError(message, isTerminating) {
  console.log('barnowl-rfcontrols: STOMP WebSocket error', message);

  if(isTerminating) {
    console.log('barnowl-rfcontrols: STOMP WebSocket terminating due to error');
  }
};


module.exports = WsListener;
