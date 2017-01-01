var log		= require('bunyan').createLogger({
    name: "Module::User System",
    level: 'trace'
});

// docker run --name coauth -d -p 2884:80\
// 		-v $$(pwd)/db:/var/www/db\
// 		-e COAUTH_APIKEY=502fbc82-6bfc-4e47-ad36-a8c23ee7b130\
// 		webheroes/coauth
var coauthSDK		= require('coauth-sdk');
var coauth		= coauthSDK.v1("http://localhost:2884",
				       "502fbc82-6bfc-4e47-ad36-a8c23ee7b130");

var methods		= require('./methods.js');

module.exports		= function (server, router) {
    server.use(require('./auth.js'));
    router.executables(methods);
    return {
	"coauth": coauth
    }
};
