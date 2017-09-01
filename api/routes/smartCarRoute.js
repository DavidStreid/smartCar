'use strict';
module.exports = function(app) {
  var smartCar = require('../controllers/smartCarController');

  // SmartCar API Routes
  app.route('/vehicles/:id')
    .get(smartCar.vehicleInfo)

  app.route('/vehicles/:id/doors')
    .get(smartCar.security)

  app.route('/vehicles/:id/fuel')
    .get(smartCar.fuelRange)

  app.route('/vehicles/:id/battery')
    .get(smartCar.batteryRange)

  app.route('/vehicles/:id/engine')
    .post(smartCar.engine)
};