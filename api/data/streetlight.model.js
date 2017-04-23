var mongoose=require("mongoose");

var streetlightSchema=new mongoose.Schema({
	
	streetlight_id: String,

	intensityOnPhone: {
		type: Number,
		min:0,
		max:100,
	},

	targetBrightness: {
		type: Number,
		min:0,
		max:100,
		"default": 0
	},

	coordinatesOfStreetlight : {
			type:[Number],
			index:'2dsphere',
		}

});

mongoose.model("Streetlight", streetlightSchema);