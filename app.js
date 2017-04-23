require("./api/data/db.js");
var express=require("express");
var mongoose=require("mongoose");
var bodyParser=require("body-parser");
var session = require('express-session');

var app=express();
app.set('trust proxy', 1);
app.use(session({
  secret: 'guess',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: true }
}));

app.use(bodyParser.urlencoded({ extended: true }));

var Streetlight = mongoose.model('Streetlight');

var runGeoQuery = function(req,res){

	session.usercoord_lng=parseFloat(req.query.lng);
	session.usercoord_lat=parseFloat(req.query.lat);
	var target=100-(parseInt(req.query.intensity));
	console.log("Value of target: " +target);

	/*console.log("yahan par");
	console.log(session.usercoord_lng);
	*/
	// var session.usercoord_lng = parseFloat(req.query.lng);
  	// var session.usercoord_lat = parseFloat(req.query.lat);

  if (isNaN(session.usercoord_lng) || isNaN(session.usercoord_lat)) {
    res
      .status(400)
      .json({
        "message" : "If supplied in querystring, session.usercoord_lng and session.usercoord_lat must both be numbers"
      });
    return;
  }

  // A geoJSON point
  var point = {
    type : "Point",
    coordinates : [session.usercoord_lng, session.usercoord_lat]
  };

  var geoOptions = {
    spherical : true,
    maxDistance : 100,
    num : 1
  };

  Streetlight
    .geoNear(point, geoOptions, function(err, results, stats) {
      console.log('Geo Results', results);
      console.log('Geo stats', stats);
      if (err) {
        console.log("Error finding hotels");
        res
          .status(500)
          .json(err);
      } else {
      	//set the target brightness of the closest streetlight
      	results[0].obj.targetBrightness=target;
      	//return the results found. In this case it's just one result.
        res
          .status(200)
          .json(results);
          //call arduino's api with targetBrightness variable sent to it!
      }
    });
}

app.post("/userPhoneDetails",function(req,res){

if (req.query && req.query.lat && req.query.lng && req.query.intensity) {
    runGeoQuery(req, res);
    return;
  }else {
  	console.log("lat, lng, and intensity fields are must.");
  }

});

app.post("/setHwStatus",function(req,res){
//pass the status of bulb- on or off ------ pass "Signal" to hardware alongwith the
// hardware details and target intensity of bulb


})

app.post("/setHwDetails",function(req,res){
//set the details of hardware like lcoation and id
Streetlight.create({
	streetlight_id: req.query.id,
	//targetBrightness: req.query.brightness,
	coordinatesOfStreetlight : [parseFloat(req.query.lng), parseFloat(req.query.lat)]
},function(err,hwPost){
	if(err){
		console.log("Error while inserting hardware data!" + err);
	}else{
		res
		   .status(201)
		   .json(hwPost);
		}
	})
})

app.get("/",function(req,res){
	res.send("Page coming soon!");
})

app.listen(3000, function(){
	console.log("server started...");
});