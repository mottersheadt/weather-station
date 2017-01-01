var bunyan	= require('bunyan');
var log		= bunyan.createLogger({
    name: "base_validations",
    level: 'trace'
});

function traverse(source, string) {
    var segs		= string.split('.');
    var current		= source;
    for(var i=0; i<segs.length; i++) {
	current		= current[segs[i]];
	if (current === undefined) return undefined;
    }
    return current;
}

module.exports		= {
    isInteger: function(args, _, validate) {
	var data	= this.args;
	var obj		= args[0];
	var keys	= args[1];
	var strict	= args[2];
	for (var i in keys) {
	    var v	= obj[keys[i]];
	    if (v === undefined && strict === false)
		continue;

	    if ( v === '' || (isNaN(v) && parseInt(v) != v) )
		return validate("'"+keys[i]+"' is must be an integer, not value '"+v+"'");
	}
	return validate(true);
    },
    isBoolean: function(args, _, validate) {
	var data	= this.args;
	var obj		= args[0];
	var keys	= args[1];
	var strict	= args[2];
	for (var i in keys) {
	    var v	= obj[keys[i]];
	    if (v === undefined && strict === false)
		continue;

	    if ( [true,false,0,1].indexOf(v) === -1 )
		return validate("'"+keys[i]+"' is must be a boolean, not value '"+v+"'");
	}
	return validate(true);
    },
    required: function(args, _, validate) {
	var self	= this;
	var data	= this.args;
	var obj		= args[0];
	var args	= args[1];
	for (var i in args) {
	    var p	= traverse(obj, args[i]);
	    if ( p===null
		 || p===undefined
		 || p===""
		 || ( Array.isArray(p) && p.length===0 )
		 || ( typeof p==='object' && Object.keys(p).length===0 )
	       )
		return validate(self.path+": Missing parameter: " + args[i]);
	}
	return validate(true);
    },
    notEmpty: function(args, _, validate) {
	var data	= this.args;
	var obj		= args[0];
	var args	= args[1];
	for (var i in args) {
	    var p	= obj[args[i]];
	    if ( p===null
		 || p===""
		 || ( Array.isArray(p) && p.length===0 )
		 || ( typeof p==='object' && Object.keys(p).length===0 )
	       )
		return validate("Parameter cannot be empty: " + args[i]);
	}
	return validate(true);
    },
    filter: function(args, _, validate) {
	var data	= this.args;
	var obj	= args[0];
	var args	= args[1];
	for (var i in obj)
	    if (args.indexOf(i) === -1)
		delete obj[i];
	return validate(true);
    },
    allowed: function(args, _, validate) {
	var data	= this.args;
	var obj		= args[0];
	var args	= args[1];
	for (var i in obj) {
	    if (args.indexOf(i) === -1) {
		return validate("You are not allowed to manipulate the value of '"+i+"'");
	    }
	}
	return validate(true);
    }
}
