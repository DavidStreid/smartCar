var express = require('express'),
  app = express(),
  port = process.env.PORT || 3000,
  Task = require('./api/models/smartCarModel'),		// Load Created Model
  bodyParser = require('body-parser');				// Parse incoming bodies

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var routes = require('./api/routes/smartCarRoute'); //importing route
routes(app); //register the route

app.listen(port);

console.log('SmartCar RESTful API server started on: ' + port);