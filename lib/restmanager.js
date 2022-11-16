/**
 * Copyright reelyActive 2022
 * We believe in an open Internet of Things
 */


const http = require('http');
const https = require('https');


const DEFAULT_HOSTNAME = 'localhost';
const DEFAULT_PORT = 8888;
const DEFAULT_PATH = '/data-services/rest';
const DEFAULT_USE_HTTPS = false;
const DEFAULT_USERNAME = 'admin';
const DEFAULT_PASSWORD = 'admin';


/**
 * RestManager Class
 * Facilitates interactions with the RFCOS REST API.
 */
class RestManager {

  /**
   * RestManager constructor
   * @param {Object} options The options as a JSON object.
   * @constructor
   */
  constructor(options) {
    options = options || {};

    this.useHttps = options.useHttps || DEFAULT_USE_HTTPS;
    this.hostname = options.hostname || DEFAULT_HOSTNAME;
    this.port = options.port || DEFAULT_PORT;
    this.path = options.path || DEFAULT_PATH;
    this.username = options.username || DEFAULT_USERNAME;
    this.password = options.password || DEFAULT_PASSWORD;

    if(this.useHttps) {
      this.agent = new https.Agent({ keepAlive: true });
    }
    else {
      this.agent = new http.Agent({ keepAlive: true });
    }
  }

  /**
   * GET the /regions.
   * @param {function} callback The function to call on completion.
   */
  retrieveRegions(callback) {
    retrieve(this, '/regions', (error, data) => {
      let regionIds = [];

      if(!error) {
        data.forEach((region) => {
          if(region.hasOwnProperty('id')) {
            regionIds.push(region.id);
          }
        });
      }

      return callback(regionIds);
    });
  }

}


/**
 * Get the given route and return the data.
 * @param {RestManager} instance The RestManager instance.
 * @param {String} subpath The subpath to GET.
 * @param {function} callback The function to call on completion.
 */
function retrieve(instance, subpath, callback) {
  let options = {
      hostname: instance.hostname,
      port: instance.port,
      path: instance.path + subpath,
      auth: instance.username + ':' + instance.password,
      agent: instance.agent,
      method: 'GET',
      headers: { "Accept": "application/json" }
  };

  if(instance.useHttps) {
    getViaHttps(options, callback);
  }
  else {
    getViaHttp(options, callback);
  }
}


/**
 * GET via HTTP.
 * @param {Object} options The request options.
 * @param {function} callback The function to call on completion.
 */
function getViaHttp(options, callback) {
  let req = http.request(options, (res) => {
    let data = '';

    res.setEncoding('utf8');
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
      if(res.statusCode !== 200) {
        return callback(new Error('HTTP GET returned status code',
                                  res.statusCode));
      }
      else {
        return callback(null, JSON.parse(data));
      }
    });
  });

  req.on('error', callback);
  req.end();
}


/**
 * GET via HTTPS.
 * @param {Object} options The request options.
 * @param {function} callback The function to call on completion.
 */
function getViaHttps(options, callback) {
  let req = https.request(options, (res) => {
    let data = '';

    res.setEncoding('utf8');
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
      if(res.statusCode !== 200) {
        return callback(new Error('HTTPS GET returned status code',
                                  res.statusCode));
      }
      else {
        return callback(null, JSON.parse(data));
      }
    });
  });

  req.on('error', callback);
  req.end();
}


module.exports = RestManager;
