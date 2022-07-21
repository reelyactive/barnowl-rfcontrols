/**
 * Copyright reelyActive 2022
 * We believe in an open Internet of Things
 */


const Raddec = require('raddec');


/**
 * RfControlsDecoder Class
 * Decodes data streams from one or more RF Controls readers and forwards the
 * packets to the given BarnowlRfControls instance.
 */
class RfControlsDecoder {

  /**
   * RfControlsDecoder constructor
   * @param {Object} options The options as a JSON object.
   * @constructor
   */
  constructor(options) {
    options = options || {};

    this.barnowl = options.barnowl;
  }

  /**
   * Handle data from a given device, specified by the origin
   * @param {Buffer} data The data as a buffer.
   * @param {String} origin The unique origin identifier of the device.
   * @param {Number} time The time of the data capture.
   * @param {Object} decodingOptions The packet decoding options.
   */
  handleData(data, origin, time, decodingOptions) {
    let self = this;
    let raddecs = [];

    if(Array.isArray(data)) {
      data.forEach(blink => {
        let raddec = new Raddec({
            transmitterId: blink.tagID.toLowerCase(),
            transmitterIdType: Raddec.identifiers.TYPE_TID96,
            timestamp: blink.locateTime,
            position: [ blink.x, blink.y, blink.z ]
        });
        blink.antennaIds.forEach(antennaId => {
          raddec.addDecoding({
              receiverId: antennaId,
              receiverIdType: Raddec.identifiers.TYPE_UUID128,
              rssi: Math.round(blink.rssi / 10)
          }); // TODO: rssi for subsequent antennae is unknown?
        });

        raddecs.push(raddec);
      });
    }

    raddecs.forEach(function(raddec) {
      self.barnowl.handleRaddec(raddec);
    });
  }
}


module.exports = RfControlsDecoder;
