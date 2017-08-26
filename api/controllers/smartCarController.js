'use strict';
var request = require('request');

var gmAPI = "http://gmapi.azurewebsites.net/"

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
    else if(body.status==404){
      res.json({"status": 404, "message": "Vehicle Not Found"})
    }
    else {
      res.json({"status": 404, "message": "Service Not Available"}) 
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
        else if(body.status==404){
          res.json({"status": 404, "message": "Vehicle Not Found"})
        }
        else {
          res.json({"status": 404, "message": "Service Not Available"}) 
        }
    }
  );
};

function callEnergyService(id, energyType, res){
  // id: int - vehicle id, energyType: string - tankLevel/batteryLevel
  console.log("smartCarController::callEnergyService");

  // Make Request
  let vehicleEnergyService = gmAPI + 'getEnergyService';
  let VES_Req = {"id": id, "responseType": "JSON" };

  request.post(
    vehicleEnergyService, { json: VES_Req }, 
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
        else if(body.status==404){
          res.json({"status": 404, "message": "Vehicle Not Found"})
        }
        else {
          res.json({"status": 404, "message": "Service Not Available"}) 
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

  // Make Request
  let vehicleEngineService = gmAPI + 'actionEngineService';
  // TODO - Check action is either "STOP" or "START"
  let command = req.body.action == "START" ? "START_VEHICLE" : "STOP_VEHICLE" ;
  let VEngS_Object = {"id": req.params.id, "command": command, "responseType": "JSON" };

  request.post(
    vehicleEngineService, { json: VEngS_Object }, 
    function (error, response, body) {
      if (!error && body.status == 200) {
        res.json({"status": body.actionResult.status})
      }
      else if(body.status==404){
        res.json({"status": 404, "message": "Vehicle Not Found"})
      }
      else {
        res.json({"status": 404, "message": "Service Not Available"}) 
      }
    }
  );
};