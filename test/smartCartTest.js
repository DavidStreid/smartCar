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
    it("returns 404 if invalid ID", function(done) {
	  let id = "4321"
	  let url = base + id
      request(url, function(error, response, body) {
      	body = JSON.parse(response.body);
        expect(body.status).to.equal(404);
        done();
      });
    });
  });
});