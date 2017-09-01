'use strict';
var request = require('request');
var model   = require("../models/smartCarModel");
var gmAPI   = "http://gmapi.azurewebsites.net/"

exports.vehicleInfo = function(req, res) {
   // GM_Resp: { vin, color, fourDoorSedan, twoDoorCoupe, driveTrain }

  console.log("smartCarController::vehicleInfo");

  // Make Request
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

  let reqPost = request.post(vehicleInfoService, VIS_Req, callback);
};

exports.security = function(req, res) {
  console.log("smartCarController::security");

  // Make Request
  let vehicleSecurityService = gmAPI + 'getSecurityStatusService';
  let VSS_Req = {"id": req.params.id, "responseType": "JSON" };
  request.post(
    vehicleSecurityService, { json: VSS_Req }, 
    function (error, response, body) {
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
  );
};

function callEnergyService(id, energyType, res){
  // id: int - vehicle id, energyType: string - tankLevel/batteryLevel
  console.log("smartCarController::callEnergyService");

  // Make Request
  let vehicleEnergyService = gmAPI + 'getEnergyService';
  let VES_Req = { json : {"id": id, "responseType": "JSON" } };

  request.post(
    vehicleEnergyService, VES_Req , 
    function (error, response, body) {
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
  );
}

exports.fuelRange = function(req, res) {
  console.log("smartCarController::fuelRange");
  callEnergyService(req.params.id,"tankLevel",res)
};


exports.batteryRange = function(req, res) {
  console.log("smartCarController::batteryRange");
  callEnergyService(req.params.id,"batteryLevel",res)
};


exports.engine = function(req, res) {
  console.log("smartCarController::engine");

  let action = req.body.action
  // Validate input - Should be "STOP" or "START"
  console.log("\tAction: " + action);
  if(! (action == "STOP" || action == "START")){
    let body = {"status": 404, "message": "Invalid command - should be either STOP or START"}
    res.json(body);
    return;
  }

  // Make Request
  let vehicleEngineService = gmAPI + 'actionEngineService';
  let command = (action == "START") ? "START_VEHICLE" : "STOP_VEHICLE" ;
  let VEngS_Object = {"id": req.params.id, "command": command, "responseType": "JSON" };

  request.post(
    vehicleEngineService, { json: VEngS_Object }, 
    function (error, response, body) {
      if (!error && body.status == 200) {
        let status = body.actionResult.status == "EXECUTED" ? "success" : "error";
        let obj = {"status": status}
        res.json(obj);
      }
      else{
        handleFailStatus(res,body.status);
      } 
    }
  );
};

function handleFailStatus(res, status){
  if(status==404){
    let status = {"status": 404, "message": "Vehicle Not Found"}
    res.json(status)
  }
  else {
    status = {"status": 500, "message": "Service Not Available"};
    res.json(status); 
  }
}