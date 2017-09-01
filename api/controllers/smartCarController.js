'use strict';
var request = require('request');
var model   = require("../models/smartCarModel");
var gmAPI   = "http://gmapi.azurewebsites.net/"

var logging_enabled = true;     // Log method handling of requests

exports.vehicleInfo = function(req, res) {
  /*
    Requests vehilcle information (vin, color, # doors, & driveTrain) from GM API
    GM Resp: {...
      "data": { 
        "vin": {"type": "String","value": "..." },
        "color": { "type": "String", "value": "..."},
        "fourDoorSedan": { "type": "Boolean", "value": "..." },
        "twoDoorCoupe": { "type": "Boolean", "value": "..." },
        "driveTrain": { "type": "String", "value": "..." }
      }
    }
    SmartCar Resp: {
      { "vin": "...", "color": "...", "doorCount": int, "driveTrain": "..." }
    }
  */

  if(logging_enabled) {console.log("smartCarController::vehicleInfo"); }

  // Request Set-up
  let vehicleInfoService = gmAPI + 'getVehicleInfoService';
  let VIS_Req = {json: {"id": req.params.id, "responseType": "JSON" }};
  function callback(error,response,body){
    if (!error && body.status == 200) {
      let data = body.data;
      res.json({
        "vin": data.vin.value,
        "color": data.color.value,
        "doorcount": data.fourDoorSedan.value == 'True' ? 4 : 2,
        "driveTrain": data.driveTrain.value
      })
    }
    else{
      handleFailStatus(res,body.status);
    } 
  }

  // Make Request
  let reqPost = request.post(vehicleInfoService, VIS_Req, callback);
};

exports.security = function(req, res) {
  /*
    Requests door information of car 
    GM Resp: {
      ...
      "data": {
      "doors": {
        "type": "Array",
        "values": [ { "location": { "type": "String", "value": "..."},
                        "locked": { "type": "Boolean", "value": "..." }
                    ...]
      }
    }
    SmartCar Resp: { [ { "location": "...", "locked": boolean }, ... ] }
  */

  if(logging_enabled) { console.log("smartCarController::security"); }

  // Request Set-Up
  let vehicleSecurityService = gmAPI + 'getSecurityStatusService';
  let VSS_Req = { json: {"id": req.params.id, "responseType": "JSON" } } ;
  function callback(error,response,body){
    if (!error && body.status == 200) {
      let doors = body.data.doors.values;
      let door_data = []
      for(let i = 0; i<doors.length; i++){
        door_data.push({
          "location": doors[i].location.value, 
          "locked": doors[i].locked.value=="False" ? false : true})
      }
      res.json({door_data})
    }
    else{
      handleFailStatus(res,body.status);
    } 
  }

  // Make Request
  request.post( vehicleSecurityService, VSS_Req , callback );
};

function callEnergyService(id, energyType, res){
  /*
    Helper function to request battery/fuel levels. Note - either tankLevel or batteryLevel will have a "null" value
    GM Resp: {
      ...
      "data": {
        "tankLevel": { "type": "Number", "value": "..." },  
        "batteryLevel": { "type": "Number", "value": "..." 
      }
    }
    SmartCar Resp: { "percent": int }
  */
  if(logging_enabled) { console.log("smartCarController::callEnergyService"); }

  // Request Set-Up
  let vehicleEnergyService = gmAPI + 'getEnergyService';
  let VES_Req = { json : {"id": id, "responseType": "JSON" } };
  function callback(error,response,body){
    if (!error && body.status == 200) {
      let data = body.data;
      // Null value indicates car does not have energy type requested
      if(data[energyType].value=="null"){
        res.json({"Error": "Incorrect CarType - Car does not have a " + energyType})  
      }
      else {
        res.json({"percent": parseFloat(data[energyType].value)});
      }
    }
    else{
      handleFailStatus(res,body.status);
    } 
  }

  // Make Request
  request.post( vehicleEnergyService, VES_Req , callback );
}

/*
  Handle smartCar requests for tank & battery levels using same GM endpoint
*/
exports.fuelRange = function(req, res) {
  if(logging_enabled) { console.log("smartCarController::fuelRange"); }
  callEnergyService(req.params.id,"tankLevel",res)
};
exports.batteryRange = function(req, res) {
  if(logging_enabled) { console.log("smartCarController::batteryRange"); }
  callEnergyService(req.params.id,"batteryLevel",res)
};


exports.engine = function(req, res) {
  /*
    Requests to start/stop vehicle

    GM Resp: {
      ...
      "actionResult": { "status": "EXECUTED|FAILED" }
    }
    SmartCar Resp: { "status": "success|error" }
  */
  if(logging_enabled) { console.log("smartCarController::engine"); } 

  let action = req.body.action

  // Validate input - Should be "STOP" or "START"
  if(! (action == "STOP" || action == "START")){
    let body = {"status": 404, "message": "Invalid command - should be either STOP or START"}
    res.json(body);
    return;
  }

  // Request Set-Up
  let vehicleEngineService = gmAPI + 'actionEngineService';
  let command = (action == "START") ? "START_VEHICLE" : "STOP_VEHICLE" ;
  let VEngS_Object = { json: {"id": req.params.id, "command": command, "responseType": "JSON" } };
  function callback(error, response, body){
    if (!error && body.status == 200) {
      let status = body.actionResult.status == "EXECUTED" ? "success" : "error";
      let obj = {"status": status}
      res.json(obj);
    }
    else{
      handleFailStatus(res,body.status);
    } 
  }
  // Make Request
  request.post( vehicleEngineService, VEngS_Object , callback );
};

function handleFailStatus(res, status){
  /*
    Helper function to handle non-200 responses from the GM API
  */
  if(status==404){
    let status = {"status": 404, "message": "Vehicle Not Found"}
    res.json(status)
  }
  else {
    status = {"status": 500, "message": "Service Not Available"};
    res.json(status); 
  }
}