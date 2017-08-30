var expect    = require("chai").expect;
var api 	  = require("../api/controllers/smartCarController");
var request   = require('request');

var base = "http://localhost:3000/vehicles/"
var valid_id = "1234/"
describe("SmartCar API", function() {

  // NOTE - Test invalid ids first as their callback (with quicker latency) can interfere w/ other tests
  describe("SmartCar API with invalid id", function() {
    // Check Invalid id
    let invalid_id = "4321/";
    let host = base + invalid_id;
    let endpoints = ['','doors','fuel','battery']
    for(let i = 0; i<endpoints.length; i++){
      let e = endpoints[i];
      let url = host + e;
      describe("Endpoint: " + url + " with invalidID", function(){
        it("returns 404 & Vehicle Not Found", function(done){
          request(url, function(error, response, body) {
            expect(JSON.parse(body).status).to.equal(404);
            expect(JSON.parse(body).message).to.equal("Vehicle Not Found");
            done();
          });
        })
      });
    }
    let url = host + "engine"
    describe("Endpoint: " + url + " with invalidID", function(){
      it("returns 404 & Vehicle Not Found", function(done){
        let obj = { "action": "start" }
        request.post(url, obj, function (error, response, body) {
          expect(JSON.parse(body).status).to.equal(404);
          expect(JSON.parse(body).message).to.equal("Invalid command - should be either STOP or START");
          done();
        });
      })
    })
  })
  describe("GM: getVehicleInfoService, SmartCar: /", function() {
    it("gets vehicle info if valid ID", function(done) {
	  let url = base + valid_id
      request(url, function(error, response, body) {
        expect(response.statusCode).to.equal(200);
        expect(body).to.equal("{\"vin\":\"123123412412\",\"color\":\"Metallic Silver\",\"doorcount\":4,\"driveTrain\":\"v8\"}");
        done();
      });
    });
  });

  describe("GM:getSecurityStatusService, SmartCar: /door", function() {
    it("gets security status as boolean of valid door if valid ID", function(done) {
	  let rsc = "doors";
	  let url = base + valid_id + rsc;
	  var pos = new Set(["frontLeft", "backRight", "backLeft", "frontRight"]);

	  // Populate initial door locked status
      request(url, function(error, response, body) {
        expect(response.statusCode).to.equal(200);
        let doors = JSON.parse(body).door_data;
        for(let i = 0; i<doors.length; i++){
        	expect(true).to.equal(pos.has(doors[i].location));
        	expect(typeof(doors[i].locked)).to.equal("boolean");
        }
        done();
      });
    });
  });

  describe("GM:actionEngineService, SmartCar API: /engine", function(){
    
    let rsc = "engine";

    commands = ["START", "STOP"];

    for(let i = 0; i<commands.length; i++){
      it(commands[i].toLowerCase() + " car", function(done){
        let obj = {"action": commands[i]}
        let engine_service = base + valid_id + rsc;

        let options = {
          url: engine_service,
          headers: {
            'content-type': 'application/json'
          },
          json: obj
        };

        function callback(error, response, body){
          expect(response.statusCode).to.equal(200);
          cmd_status = body.status;
          expect(cmd_status == "error" || cmd_status == "success").to.equal(true);
          done();
        }

        request.post(options, callback);
      })
    }
  })

  // NOTE - Delay in callback can cause errors if this test precedes others
  describe("GM:getEnergyService, SmartCar API: /fuel & /battery", function() {
    let energyType = [["fuel", "tankLevel","1234/"], ["battery", "batteryLevel","1235/"]];
    it("gets energy levels as float", function(done) {
      for (let i = 0; i<energyType.length; i++){
        let type = energyType[i][0];
        let field = energyType[i][1];
        let id = energyType[i][2];

        
        let energy_url = base + id + type;

        // Populate initial door locked status
          request(energy_url, function(error, response, body) {
            expect(response.statusCode).to.equal(200);
            let pct = JSON.parse(body)[field].percent;
            expect(0<=pct && pct <= 100).to.equal(true); 
          });
        }
        done();    
    });
  });
});