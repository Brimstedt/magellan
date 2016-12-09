"use strict";

var _ = require("lodash");
var request = require("request");
var portscanner = require("portscanner");

var PORT_STATUS_IN_USE = 0;
var PORT_STATUS_AVAILABLE = 1;

var checkPortStatus = function (desiredPort, callback, opts) {
  var _request = request;
  /* istanbul ignore next */
  if (opts && opts.request) {
    _request = opts.request;
  }
  var _portscanner = portscanner;
  /* istanbul ignore next */
  if (opts && opts.portscanner) {
    _portscanner = opts.portscanner;
  }
  var _console = console;
  /* istanbul ignore next */
  if (opts && opts.console) {
    _console = opts.console;
  }

  _request("http://127.0.0.1:" + desiredPort + "/wd/hub/static/resource/hub.html", function (seleniumErr) {
    if (seleniumErr && seleniumErr.code === "ECONNREFUSED") {
      _portscanner.checkPortStatus(desiredPort, "127.0.0.1", function (error, portStatus) {
        if (portStatus === "open") {
          return callback(PORT_STATUS_IN_USE);
        } else {
          return callback(PORT_STATUS_AVAILABLE);
        }
      });
    } else {
      _console.log("Found selenium HTTP server at port " + desiredPort + ", port is in use.");
      return callback(PORT_STATUS_IN_USE);
    }
  });
};

//
// Given an array portNumbers of the form:
//
// [1234, 5678, ...]
//
// checkPortRange will call callback() with a list of port statuses in the form:
//
// [{ port: number, available: boolean }]
//
var checkPortRange = function (portNumbers, callback, opts) {
  portNumbers = _.cloneDeep(portNumbers);
  var statuses = [];

  var checkNextPort = function () {
    if (portNumbers.length > 0) {
      var portToCheck = portNumbers.shift();

      checkPortStatus(portToCheck, function (portStatus) {
        statuses.push({
          port: portToCheck,
          available: portStatus === PORT_STATUS_AVAILABLE
        });
        checkNextPort();
      }, opts);
    } else {
      return callback(statuses);
    }
  };

  checkNextPort();
};

module.exports = checkPortRange;
