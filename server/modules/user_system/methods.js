var log        = require('bunyan').createLogger({
    name: "Module::User System",
    level: 'trace'
});
var whincUtils        = require('whincutils');
var Py            = require('pythonify');
var Promise        = whincUtils.Promise;

function getUUID(transaction, id) {
    return new Promise(function(f,r) {
        var column    = ! Py(id+"").isdigit()
        ? 'email' : 'id';
        transaction('users').where(column, id).then(function(result) {
            if (! (result && result[0]))
            r({
                error: "User Not Found",
                message: "No user was found for email '"+id+"'"
            })
            else
            f(result[0].uuid);
        }, r); // This error should be made to respond differently since it is a DB error
    });
}

function error_response(cb) {
    return function(err) {
        log.error(err);
        cb({
            "error": err.name || err.error,
            "message": err.message
        });
    }
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
            if(!ignore_errors && typeof d === "object" && d !== null && d.error) {
                return r(d.message || d.error);
            }
            fn(f, r, d);
        }).catch(function(err) {
            log.error("P caught error:", err);
            throw new Error(err)
        });
    }
}

var ERRORS = {
    500: {
        error: "Internal Server Error",
        message: "An error occured that the server was unable to handle ergo your request cannot be completed"
    },
    "NO_SESSION": {
        error: "No Session Found",
        message: "Could not logout of non-existant session"
    },
}

module.exports = {
    "User": {
        "create": function(args, resp) {
            var data        = this.args;
            var self        = this;
            var password    = data.columns.password;
            delete data.columns.password;
            data.transaction('users')
            .insert(data.columns).then(function(ids) {
                var id    = ids[0];
                data.coauth.create(password).then(function($user) {
                    data.transaction('users')
                    .where('id', id)
                    .update({
                        "uuid": $user.id
                    }).then(function(affected) {
                        self.respondWith('/users/'+id, resp);
                    }, db_error(resp));
                }, error_response(resp));
            }, db_error(resp));
        },
        "update": function(args, resp) {
            var self        = this;
            var data        = this.args;
            var coauth      = data.coauth;
            self.explode(args, function(id, file) {
                Promise.sequence([
                    // Credential Update
                    P(function(f,r) {
                        var pwd     = data.columns.password;
                        var npwd    = data.columns.new_password;
                        if (npwd === undefined)
                        return f();

                        getUUID(data.transaction, id).then(function(uuid) {
                            $user   = coauth.user(uuid);
                            $user.changePassword(pwd, npwd).then(function(status) {
                                f();
                            }, r);
                        });
                    }),
                    // Upload new file
                    P(function(f,r) {
                        if(! file) return f(null);
                        console.log("going to upload file")
                        return self.method('File.upload', file).then(f,r);
                    }),
                    // User Update
                    P(function(f,r,fileResp) {
                        if(fileResp !== null) {
                            data.columns.picture = fileResp.data.id;
                        }
                        delete data.columns.password;
                        delete data.columns.new_password;

                        data.transaction('users')
                        .where('id', id)
                        .update(data.columns).then(function(affected) {
                            self.respondWith('/users/'+id, resp);
                        }, db_error(resp));
                    })
                ]).catch(db_error(resp));
            })
        },
        "deactivate": function(args, resp) {
            this.args.transaction('users')
            .where('id', args[0])
            .update({
                "active": 0
            }).then(function(affected) {
                resp({ "status": affected !== 0,
                "affected": affected });
            }, db_error(resp));
        },
        "reactivate": function(args, resp) {
            this.args.transaction('users')
            .where('id', args[0])
            .update({
                "active": 1
            }).then(function(affected) {
                resp({ "status": affected !== 0,
                "affected": affected });
            }, db_error(resp));
        },
        "delete": function(args, resp) {
            if (this.args.data.permanent !== 'true')
            return resp({
                "error": "Permanent Flag Required",
                "message": "As an extra security measure you must include ?permanent=true with your delete request"
            })
            this.args.transaction('users')
            .where('id', args[0])
            .del().then(function(affected) {
                resp({ "status": affected !== 0,
                "affected": affected });
            }, db_error(resp));
        },
        "login": function(args, resp) {
            var data        = this.args;
            var self        = this;
            var email       = typeof data.data.email === 'string' && data.data.email.toLowerCase();

            function login() {
                getUUID(data.transaction, data.data.email).then(function(uuid) {
                    log.info(uuid, data.data.password);
                    data.coauth.user(uuid).session(data.data.password).then(function($session) {
                        if ($session.id === undefined)
                        return resp(ERRORS[500]);

                        data.response.cookie('session', $session.id, {
                            expires: new Date(Date.now() + (60*60*24*365*1000))
                        });

                        resp({
                            "data": {
                                "email": data.data.email,
                                "session": $session.id
                            }
                        });
                    }, error_response(resp));
                }, error_response(resp));
            }

            if (data.data.email === 'admin@example.com') {
                data.transaction('users').where('email', email).then(function(user) {
                    if (user[0] && !user[0].uuid) {
                        // Create user in coauth with password testing
                        data.coauth.create('testing').then(function($user) {
                            // Create user in coauth with password testing
                            data.transaction('users')
                            .where('email', email)
                            .update({
                                "uuid": $user.id
                            }).then(function(affected) {
                                login();
                            }, db_error(resp));
                        }, error_response(resp));
                    }
                    else {
                        login();
                    }
                });
            }
            else
            login();

        },
        "logout": function(args, resp) {
            var self        = this;
            var coauth      = this.args.coauth;
            var session = this.args.request.cookies['session'];

            if (session === undefined)
            return resp(ERRORS.NO_SESSION);

            $session        = coauth.session(session);
            $session.close().then( function(status) {
                self.args.response.clearCookie('session');
                return resp({
                    "data": {
                        "status": status,
                        "session": $session.id
                    }
                });
            }, error_response(resp));
        }
    }
};
