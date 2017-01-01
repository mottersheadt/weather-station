var log          = require('bunyan').createLogger({
    name: "Weather App",
    level: 'trace'
});

var whincutils   = require('whincutils');
var Py           = whincutils.Pythonify;
var Promise      = whincutils.Promise;

var ChaosServer  = require('chaosserver');
var restruct     = require('restruct-data');
var fill         = ChaosServer.ChaosRouter.populater; // must be the same instance as chaosrouter

var Base         = require('./validations/Base');
var Update       = require('./validations/Update');

var serverConfig = require('./server-config.js');
var server       = ChaosServer(serverConfig);
var router       = server.getRouter();

fill.method('date', function(d) {
    return d.toISOString() + '+0000';
});
fill.method('countDistinct', function(rows, key) {
    var o = {};
    for (var i in rows) {
        if (rows[i][key] !== null)
            o[rows[i][key]] = true;
    }
    return Object.keys(o).length;
});

router.defaultExec = function (args, resp) {
    resp({
        "error": "Invalid API Endpoint",
        "message": "This API endpoint is not configured foo."
    });
};

server.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    next();
});

var validations        = {
    "Check": {
        "input": function(args, _, validate) {
            var opts        = args[0];
            var required    = opts.required || [];
            var notempty    = opts.notempty || [];
            var $this        = this.args;

            Promise.all([
                this.method('Check.Base.required', $this, ["data"]),
                this.method('Check.Base.required', $this.data, required),
                this.method('Check.Base.notEmpty', $this.data, notempty),
                this.method('Check.Table.destruct', $this.data, "columns"),
            ]).then(function() {
                validate(true);
            }, validate);
        },
        "Base": Base,
    }
};
var methods        = require('./methods.js');
router.executables(validations);
router.executables(methods);

server.use('/api/v1', function (req, res) {
    var endpoint    = router.route(req.path);
    log.info("path:", req.path)
    if (endpoint === false) {
        res.reply({
            "error": "Wrong Path",
            "message": "This is not a valid API endpoint",
        });
    }
    else {
        endpoint.execute({
            method: 'HTTP',
            data: req.data,
            files: req.files,
            request: req,
            response: res,
        }).then(function (result) {
            res.reply(result);
        }, function (err) {
            log.error(err);
            res.reply({
                error: err.name,
                message: err.message
            });
        }).catch(function(err) {
            log.error(err);
            res.reply({
                error: err.name,
                message: err.message
            });
        });
    }
});
log.info("derr I just done set that up for ya.");
server.listen(80);
