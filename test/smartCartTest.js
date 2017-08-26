var expect    = require("chai").expect;
var api 	  = require("../api/controllers/smartCarController");
var request   = require('request');

var base = "http://localhost:3000/vehicles/"
var valid_id = "1234/"
describe("SmartCar API", function() {
  describe("getVehicleInfoService", function() {
    it("gets vehicle info if valid ID", function(done) {
	  let url = base + valid_id
      request(url, function(error, response, body) {
        expect(response.statusCode).to.equal(200);
        expect(body).to.equal("{\"vin\":\"123123412412\",\"color\":\"Metallic Silver\",\"doorcount\":4,\"driveTrain\":\"v8\"}");
        done();
      });
    });
  });

  describe("getSecurityStatusService", function() {
    it("gets security status if valid ID", function(done) {
	  let rsc = "doors"
	  let url = base + valid_id + rsc
	  let door_status = {}
	  // Populate initial door locked status
      request(url, function(error, response, body) {
        expect(response.statusCode).to.equal(200);
        let doors = JSON.parse(body).door_data;
        for(let i = 0; i<doors.length; i++){
        	door_status[doors[i].location] = doors[i].locked;
        }
      });

      // Check to see if each status has been flipped
      request(url, function(error, response, body) {
        expect(response.statusCode).to.equal(200);
        let doors = JSON.parse(body).door_data;
        console.log(door_status);
        for(let i = 0; i<doors.length; i++){
        	console.log(doors[i].location);
        	console.log(doors[i].locked);
        	console.log(door_status[doors[i].location]);
        	expect(doors[i].locked).to.equal(!door_status[doors[i].location]);
        }
        done();
      });
    });
  });

  // Check Invalid id
  let id = "4321/";
  let host = base + id;
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
        expect(JSON.parse(body).message).to.equal("Vehicle Not Found");
        done();
      });
    })
  })
});