define(["apilib", "Py"], function(api, Py) {
    window.API		= api.defaults({
	type: 'POST',
	baseUrl: location.origin+'/api/v1/',
	contentType: 'application/json',
	processData: false,
	dataType: 'json',
	timeout: 5000
    });

    window.wsConnect	= function() {
	console.log(location);
	var regs		= {};
	var subs		= {};
	window.WS		= new WebSocket('ws://'+location.hostname);
	WS.onopen		= function() {
	    console.log('WebSocket opened');
	}
	WS.onclose	= function() {
	    console.log('WebSocket closed');
	}
	WS.onmessage	= function(res) {
	    console.log(res.data);
	    var data	= JSON.parse(res.data);
	    if (data.serial !== undefined) {
		console.log('regs', regs);
		var sid	= data.serial;
		var fr	= regs[sid];
		delete data.serial;
		if (data.error)
		    fr[1](data.data);
		else
		    fr[0](data.data);
	    }
	    else {
		console.log('subs', subs);
		for (var i in subs[data.path])
		    subs[data.path][i](data.data, data.auth);
	    }
	}
	var serial	= 0;
	return {
	    subscribe: function(path, fn) {
		if (subs[path] === undefined)
		    subs[path] = [];
		subs[path].push(fn);
		WS.send(JSON.stringify({
		    "subscribe": path,
		}));
	    },
	    get: function(path, data) {
		return new Promise(function(f, r) {
		    regs[serial]	= [f,r];
		    WS.send(JSON.stringify({
			"serial": serial,
			"path": path,
			"data": data,
		    }));
		    serial++;
		});
	    }
	}
    }
    
    function thenWrapper($P, fulfill, reject) {
	var _then	= $P.then;
	$P.then	= function(f,r) {
	    var $r	= _then.call($P, function(d) {
		return fulfill(d, f, r);
	    }, function(err) {
		return reject(err, f, r);
	    });
	    $safeApply();
	    return $r;
	}
	return $P;
    }

    window.loadAPI	= function() {
	return function(uri, opts) {
	    if (opts && typeof opts.data !== 'string')
		opts.data	= JSON.stringify(opts.data);
	    
	    return thenWrapper(API(uri, opts), function(d, f, r) {
		console.log('Data from /'+uri, d);
		var $r	= d.error
		    ? r ? r(d) : dialog.alertError(d)
		    : f(d.data, d);
		$safeApply();
		return $r;
	    }, function(err, f, r) {
		if (err.status)
		    err = {error: err.statusText,
			   message: err.responseText};
		if (typeof err === 'string') {
		    err = {error: err,
			   message: 'The request failed.'};
		}
		var $r	= r ? r(err) : dialog.alertError(err);
		$safeApply();
	    });
	};
    }
    
    window.eventAnimation	= function(e) {
	if (!(this instanceof eventAnimation))
	    return new eventAnimation(e);
	if (!e) {
	    this.element	= null;
	    this.$el	= $('<div></div>');
	    return;
	}
	
	this.element	= e.currentTarget;
	this.$el		= $(this.element);
    }
    eventAnimation.prototype = {
	rotate: function() {
	    this.$el.addClass('rotating');
	},
	disable: function() {
	    this.$el.prop('disabled', true);
	},
	stop: function() {
	    this.$el.removeClass('rotating');
	    this.$el.prop('disabled', false);
	},
	error: function(fn) {
	    var self	= this;
	    return function(err) {
		self.stop();
		return fn(err);
	    }
	}
    }

    window.eventAnimation	= function(e) {
	if (!(this instanceof eventAnimation))
	    return new eventAnimation(e);
	if (!e) {
	    this.element	= null;
	    this.$el	= $('<div></div>');
	    return;
	}
	
	this.element	= e.currentTarget;
	this.$el		= $(this.element);
    }
    eventAnimation.prototype = {
	rotate: function() {
	    this.$el.addClass('rotating');
	},
	disable: function() {
	    this.$el.prop('disabled', true);
	},
	stop: function() {
	    this.$el.removeClass('rotating');
	    this.$el.prop('disabled', false);
	},
	error: function(fn) {
	    var self	= this;
	    return function(err) {
		self.stop();
		return fn(err);
	    }
	}
    }

    window.metaRefresh	= function(scope, fetchList, next) {
    	var keys	= Py(fetchList).keys();
    	var urls	= Py(fetchList).values();
    	return function() {
    	    scope.refreshing	= true;
    	    var promises	= urls.map(function(apiUrl) {
    		return API(apiUrl);
    	    });
    	    return Promise.all(promises).then(function(all) {
    		var data	= {};
    		var resps	= {};
    		for (var i in keys) {
    		    var k	= keys[i];
    		    resps[k]	= all[i];
    		    data[k]		= all[i].data;
    		}
    		typeof next === 'function' && next(data, resps);
    		scope.refreshing = false;
    		$safeApply();
    		return Promise.resolve(all);
    	    });
    	};
    }

    window.reverseTimezone	= function(d) {
    	d.setMinutes(d.getMinutes()+d.getTimezoneOffset());
    	return d;
    }
    window.scrollToTop		= function(el) {
    	scrollTo(el, 'top');
    }
    window.scrollToBottom	= function(el) {
    	scrollTo(el, 'bottom');
    }
    window.scrollToLeft		= function(el) {
    	scrollTo(el, 'left');
    }
    window.scrollToRight	= function(el) {
    	scrollTo(el, 'right');
    }
    window.scrollTo		= function(el, direction) {
    	if (el.tagName === undefined)
    	    el	= $(el)[0];
    	if (el === undefined)
    	    return;

    	if (direction === 'top')
    	    el.scrollTop = 0;
    	if (direction === 'bottom')
    	    el.scrollTop = el.scrollHeight - el.offsetHeight;

    	if (direction === 'left')
    	    el.scrollLeft = 0;
    	if (direction === 'right')
    	    el.scrollLeft = el.scrollWidth - el.offsetWidth;
    }
});
