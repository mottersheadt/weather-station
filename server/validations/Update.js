// var bunyan		= require('bunyan');
// var log		= bunyan.createLogger({
//     name: "update_validations",
//     level: 'trace'
// });

module.exports		= {
    dataNotEmpty: function(args, _, validate) {
	var data	= this.args;
	if (Object.keys(data.data).length===0)
	    validate("No data was provided for update request");
	else validate(true);
    },
    valid: function(args, _, validate) {
	var data	= this.args;
	var obj	= data.data;
	for (var i in obj)
	    if (args.indexOf(i) === -1)
		return validate("'"+i+"' is not a valid property to update");
	return validate(true);
    },
    allowed: function(args, _, validate) {
	var data	= this.args;
	var obj	= data.data;
	for (var i in obj)
	    if (args.indexOf(i) === -1)
		return validate("You are not allowed to update the value of '"+i+"'" );
	return validate(true);
    }
}
