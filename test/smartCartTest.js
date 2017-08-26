var expect    = require("chai").expect;
var api 	  = require("../api/controllers/smartCarController");
var request   = require('request');

var base = "http://localhost:3000/vehicles/"

describe("SmartCar API", function() {
  describe("getVehicleInfoService", function() {
    it("gets vehicle info if valid ID", function(done) {
	  let id = "1234"
	  let url = base + id
      request(url, function(error, response, body) {
        expect(response.statusCode).to.equal(200);
        expect(body).to.equal("{\"vin\":\"123123412412\",\"color\":\"Metallic Silver\",\"doorcount\":4,\"driveTrain\":\"v8\"}");
        done();
      });
    });

  });

  // Check Invalid ids

  let id = "4321/";
  let host = base + id;
  let endpoints = ['','doors','fuel','battery']
  for(let i = 0; i<endpoints.length; i++){
    let e = endpoints[i];
    let url = host + e;
  	describe("Endpoint: " + url + " with invalidID", function(){
  	  it("returns 404", function(done){
        request(url, function(error, response, body) {
          expect(JSON.parse(body).status).to.equal(404);
          done();
        });
  	  })
    });
  }
  // let url = host + "engine"
  // describe("Endpoint: " + url + " with invalidID", function(){
  //   it("returns 404", function(done){
  //     let obj = {"id": id, "command": "", "responseType": "JSON" };
  //     request.post(url, obj, function (error, response, body) {
  //       expect(JSON.parse(body).status).to.equal(404);
  //       done();
  //     });
  //   })
  // })
});

  // request.post(
  //   vehicleEngineService, { json: VEngS_Object }, 
  //   function (error, response, body) {
  //     res.json({"status": body.actionResult.status})
  //   }
  // );