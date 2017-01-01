
var log = {
    trace: function() { console.log(arguments) },
    debug: function() { console.log(arguments) },
    info: function() { console.log(arguments) },
    warn: function() { console.log(arguments) },
    error: function() { console.log(arguments) }
}

var api		= function(uri, opts) {
    if (window.Promise === undefined)
	throw Error("Promise is required by whinc-apilib.js");
    if (window.jQuery === undefined)
	throw Error("jQuery.ajax is required by whinc-apilib.js");
    // Options:
    //   params	= Object of URL get parameters
    //   data	= Object for request body (JSON dump if opts.json is true)
    //   json	= Bool indicates JSON based API (default: true)
    //   baseUrl	= String for request's baseUrl
    //   method	= String HTTP method (default: POST)
    //   timeout	= Number for timeout in milliseconds
    
    if (opts === undefined)
	opts	= {};

    if (opts.baseUrl) {
	opts.url	= opts.baseUrl + uri;
	delete opts.baseUrl;
    }
    else
	opts.url	= uri;
    
    return new Promise(function(f,r) {
	opts.error	= function(xhr, status, err) {
	    r(xhr);
	};
	opts.success	= function(data, status, xhr) {
	    f(data);
	};
	jQuery.ajax(opts);
    });
    
};

// {
//     uri: uri,
//     method: "POST",
//     qs: opts.params,
//     json: true,
//     body: opts.data,
//     baseUrl: "http://localhost/v1/"+api.appID,
//     timeout: 2000
// }

api.defaults	= function(defOpts, fns) {

    if (window.jQuery === undefined)
	throw Error("jQuery.ajax is required by whinc-apilib.js");
    
    if (! (this instanceof api.defaults))
	return new api.defaults(defOpts, fns);

    if (fns === undefined)
	fns		= [];
    else if (typeof fns === 'function')
	fns		= [fns];
    
    this.defOpts	= defOpts;
    this.fns		= fns;
    this.process	= function(uri, opts, fn) {
	// Run opts through the default processing function
	if (opts === undefined)
	    opts	= {};

	var opts	= typeof fn === "function"
	    ? fn(uri, opts)
	    : self.defOpts;

	if (typeof opts !== 'object' || opts === null)
	    throw Error('Options must be an object not '+(typeof opts));
	
	return opts;
    }
    
    var self		= this;
    var apiDefaults	= function(uri, opts) {
	if (opts === undefined)
	    opts	= {};
	var opts	= jQuery.extend(jQuery.extend({}, self.defOpts), opts);

	for (var i in self.fns) {
	    opts	= self.process(uri, opts, self.fns[i]);
	}

	return api.call(this ,uri, opts);
    }
    apiDefaults.parent		= self;
    apiDefaults.defaults	= function(defOpts, fns) {
	defOpts		= jQuery.extend(jQuery.extend({}, self.defOpts), defOpts);
	if (fns === undefined)
	    fns		= [];
	else if (typeof fns === 'function')
	    fns		= [fns];
	
	fns		= self.fns.concat(fns);
	return api.defaults(defOpts, fns);
    }
    
    return apiDefaults;
}
