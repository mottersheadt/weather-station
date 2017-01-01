
module.exports = {
    "routes": "routes.json",
    "hashUploadedFiles": true,
    "hashEncoding": "sha1",
    preUpload: function(req, res, next) {
	if (req.auth.id === undefined)
	    next({
		"error": "Failed to Upload",
		"message": "Permission denied to upload" 
	    });
	else
	    next();
    },
    postUpload: function(req, res, next) {
	if (!req.files || !req.files.length)
	    return next();
	
	next();
    }
};
