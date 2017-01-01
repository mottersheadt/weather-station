var log		= require('bunyan').createLogger({
    name: "Module::User System",
    level: 'trace'
});

var fs			= require('fs');
var coauthSDK		= require('coauth-sdk');
var coauth		= coauthSDK.v1("http://localhost:2884",
				       "502fbc82-6bfc-4e47-ad36-a8c23ee7b130");

var knex		= require('knex')({
    client: 'mysql',
    connection: {
	host: 'localhost',
	user: 'root',
	password: 'testing',
	database: 'document_system'
    }
});
knex.CURRENT_TIMESTAMP	= knex.raw('CURRENT_TIMESTAMP');
var restruct		= require('restruct-data');

var authJson		= JSON.parse( fs.readFileSync("./json/auth.json", 'utf8' ) );
module.exports = function(req, res, next) {
    var anonymous_user	= restruct({
	"level": 1,
	"email": null,
	"first_name": "Anonymous",
	"last_name": "User"
    }, authJson);
    // {
    // 	"level": 1,
    // 	"email": "= null",
    // 	"type": "Public",
    // 	"blocked": false,
    // 	"name": {
    // 	    "first": "Anonymous",
    // 	    "last": "User",
    // 	    "full": "Anonymous User"
    // 	}
    // };

    var session_key		= req.cookies.session;
    if(session_key === undefined) {
    	req.auth	= anonymous_user;
    	return next()
    }

    // log.info("Getting auth info", session_key);
    var $session		= coauth.session(session_key);
    $session.user( function($auth) {
    	if($auth.id === undefined) {
    	    req.auth	= anonymous_user;
    	    return next();
    	}
    	req.session		= $session;
    	knex('users')
    	    .where('uuid', $auth.id)
    	    .then( function(data) {
    		if( data == undefined || data == null || data.length === 0 ) {
    		    log.info("Didn't get user from db");
		    res.clearCookie('session');
    		    return res.reply({
    			"error": "No User",
    			"message": "User ID given does not exist."
    		    });
    		}
    		else {
    		    var lev	= data[0]['level'];
    		    var user	= restruct(data, authJson);
    		    req.auth	= user;
    		    next();
    		}
    	    }, function(err) {
    		log.error(err);
    		req.auth	= anonymous_user;
    		next(err);
    	    });
    }, function(err) {
    	log.error(err);
    	req.auth	= anonymous_user;
    	next(err);
    });
};
