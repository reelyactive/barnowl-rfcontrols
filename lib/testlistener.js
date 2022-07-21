/**
 * Copyright reelyActive 2022
 * We believe in an open Internet of Things
 */


const DEFAULT_RADIO_DECODINGS_PERIOD_MILLISECONDS = 1000;
const DEFAULT_RSSI = -800;
const MIN_RSSI = -900;
const MAX_RSSI = -700;
const RSSI_RANDOM_DELTA = 50;
const DEFAULT_POSITION = { x: 0, y: 0, z: 0 };
const POSITION_RANDOM_DELTA = 1;
const TEST_ORIGIN = 'test';


/**
 * TestListener Class
 * Provides a consistent stream of artificially generated packets.
 */
class TestListener {

  /**
   * TestListener constructor
   * @param {Object} options The options as a JSON object.
   * @constructor
   */
  constructor(options) {
    options = options || {};

    this.decoder = options.decoder;
    this.radioDecodingPeriod = options.radioDecodingPeriod ||
                               DEFAULT_RADIO_DECODINGS_PERIOD_MILLISECONDS;
    this.rssi = [ DEFAULT_RSSI ];
    this.position = [ DEFAULT_POSITION ];
    this.decodingOptions = options.decodingOptions || {};

    setInterval(emitRadioDecodings, this.radioDecodingPeriod, this);
  }

}


/**
 * Emit simulated radio decoding packets
 * @param {TestListener} instance The given instance.
 */
function emitRadioDecodings(instance) {
  let simulatedTagEvent = {
    regionId: "7b67d028-411b-40a6-9479-22748ca414d6",
    antennaIds: [ 'b797d495-c7c9-4558-a77b-00a8059fa0b5' ],
    antennaNames: [ 'anton' ],
    tagID: "1AB00000000000000000A003",
    x: instance.position[0].x,
    y: instance.position[0].y,
    z: instance.position[0].z,
    locateTime: Date.now(),
    speed: 0.031922660768032074,
    rssi: instance.rssi[0],
    zoneName: "Zone 1",
    zoneUUID: "d910f82e-6601-4615-9b0a-bc3501b5020f",
    locationMethod: "Assumed Z",
    polarity: "CIRCULAR",
    confidenceInterval: 1.0
 }

  updateSimulatedRssi(instance);
  updateSimulatedPosition(instance);
  instance.decoder.handleData([ simulatedTagEvent ], TEST_ORIGIN, Date.now(),
                              instance.decodingOptions);
}


/**
 * Update the simulated RSSI values
 * @param {TestListener} instance The given instance.
 */
function updateSimulatedRssi(instance) {
  for(let index = 0; index < instance.rssi.length; index++) {
    instance.rssi[index] += Math.floor((Math.random() * RSSI_RANDOM_DELTA) -
                                       (RSSI_RANDOM_DELTA / 2));
    if(instance.rssi[index] > MAX_RSSI) {
      instance.rssi[index] = MAX_RSSI;
    }
    else if(instance.rssi[index] < MIN_RSSI) {
      instance.rssi[index] = MIN_RSSI;
    }
  }
}


/**
 * Update the simulated position values
 * @param {TestListener} instance The given instance.
 */
function updateSimulatedPosition(instance) {
  for(let index = 0; index < instance.position.length; index++) {
    let position = instance.position[index];

    position.x += ((Math.random() * POSITION_RANDOM_DELTA) -
                   (POSITION_RANDOM_DELTA / 2));
    position.y += ((Math.random() * POSITION_RANDOM_DELTA) -
                   (POSITION_RANDOM_DELTA / 2));
    position.z += ((Math.random() * POSITION_RANDOM_DELTA) -
                   (POSITION_RANDOM_DELTA / 2));
  }
}


module.exports = TestListener;
