//
//                                                                                                                            dddddddd
//  MMMMMMMM               MMMMMMMM                             tttt         hhhhhhh                                          d::::::d
//  M:::::::M             M:::::::M                          ttt:::t         h:::::h                                          d::::::d
//  M::::::::M           M::::::::M                          t:::::t         h:::::h                                          d::::::d
//  M:::::::::M         M:::::::::M                          t:::::t         h:::::h                                          d:::::d
//  M::::::::::M       M::::::::::M    eeeeeeeeeeee    ttttttt:::::ttttttt    h::::h hhhhh          ooooooooooo       ddddddddd:::::d     ssssssssss
//  M:::::::::::M     M:::::::::::M  ee::::::::::::ee  t:::::::::::::::::t    h::::hh:::::hhh     oo:::::::::::oo   dd::::::::::::::d   ss::::::::::s
//  M:::::::M::::M   M::::M:::::::M e::::::eeeee:::::eet:::::::::::::::::t    h::::::::::::::hh  o:::::::::::::::o d::::::::::::::::d ss:::::::::::::s
//  M::::::M M::::M M::::M M::::::Me::::::e     e:::::etttttt:::::::tttttt    h:::::::hhh::::::h o:::::ooooo:::::od:::::::ddddd:::::d s::::::ssss:::::s
//  M::::::M  M::::M::::M  M::::::Me:::::::eeeee::::::e      t:::::t          h::::::h   h::::::ho::::o     o::::od::::::d    d:::::d  s:::::s  ssssss
//  M::::::M   M:::::::M   M::::::Me:::::::::::::::::e       t:::::t          h:::::h     h:::::ho::::o     o::::od:::::d     d:::::d    s::::::s
//  M::::::M    M:::::M    M::::::Me::::::eeeeeeeeeee        t:::::t          h:::::h     h:::::ho::::o     o::::od:::::d     d:::::d       s::::::s
//  M::::::M     MMMMM     M::::::Me:::::::e                 t:::::t    tttttth:::::h     h:::::ho::::o     o::::od:::::d     d:::::d ssssss   s:::::s
//  M::::::M               M::::::Me::::::::e                t::::::tttt:::::th:::::h     h:::::ho:::::ooooo:::::od::::::ddddd::::::dds:::::ssss::::::s
//  M::::::M               M::::::M e::::::::eeeeeeee        tt::::::::::::::th:::::h     h:::::ho:::::::::::::::o d:::::::::::::::::ds::::::::::::::s
//  M::::::M               M::::::M  ee:::::::::::::e          tt:::::::::::tth:::::h     h:::::h oo:::::::::::oo   d:::::::::ddd::::d s:::::::::::ss
//  MMMMMMMM               MMMMMMMM    eeeeeeeeeeeeee            ttttttttttt  hhhhhhh     hhhhhhh   ooooooooooo      ddddddddd   ddddd  sssssssssss
//
//
//
//
//
//
//
var log        = require('bunyan').createLogger({
    name: "Methods",
    level: 'debug'
});
var fs         = require('fs');

var whincutils = require('whincutils');
var Py         = whincutils.Pythonify;
var Promise    = whincutils.Promise;

function error_response(cb) {
    return function(err) {
        log.error(err);
        cb({
            "error": err.name || err.error,
            "message": err.message
        });
    }
}

function log_error(log) {
    return function(e) {
        log.error(e);
    };
}

function db_error(cb) {
    return function(err) {
        log.error(err);
        cb({
            "error": "Internal Server Error",
            "message": "Sorry, there was an unhandled error that broke this transaction."
        });
    }
}


function P(fn, ignore_errors) {
    ignore_errors = !!ignore_errors;
    return function(d) {
        return new Promise(function(f, r) {
            if(!ignore_errors && typeof d === "object" && d.error) {
                return r(d.message || d.error);
            }
            fn(f, r, d);
        }).catch(function(err) {
            log.error("P caught error:", err);
            throw new ERR(err)
        });
    }
}

var Methods = {
    "currentTemperature": function(args, resp) {
        var self = this;
	return resp({
	    "data": {
		"celcius": 20,
		"fahrenheit": 68
	    }
	});

	read_temp().then(function(temps) {
	    "data": {
		"celcius": temps[0],
		"fahrenheit": temps[1]
	    }
	}).catch(error_response(resp));
    },
};

function read_temp_raw() {
    return new Promise(function(f,r) {
	console.log("reading raw temp...")
	fs.readFile(device_file, "utf8", function(error, fileData) {
	    if(error)
		return r(error);
	    f(fileData);
	});
    })
}

function read_temp() {
    console.log("reading temp");
    return new Promise( function(f,r) {
	read_temp_raw().then(function(raw_data) {
	    var lines = raw_data.split('\n');
	    while (lines[0].indexOf('YES') == -1 ) {
		console.log('...');
	    }

	    var equals_pos = lines[1].indexOf('t=');
	    if (equals_pos != -1) {
		var temp_string = lines[1].substr(equals_pos+2);
		var temp_c = temp_string / 1000.0;
		var temp_f = temp_c * 9.0 / 5.0 + 32.0;
		return f([temp_c, temp_f])
	    }
	}).catch(function(error) {
	    console.log("ERROR", error)
	});
    });
}

module.exports = Methods;
