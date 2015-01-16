/**
 * AppController
 *
 * @description :: Server-side logic for managing apps
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {
	'listall': function(req,res, callback) {
			App.find({}).exec(function findCB(err,applist){
			console.log("found apps: " + applist);
			callback(err, applist);
			res.json(applist);
  		});
	},
	
	'new': function(req, res) {
		res.view();
	},

	'form': function(req, res) {
		res.view();
	},

	'newbuild': function(req, res, next) {
		App.findOne(req.param('id'), function(err, foundapp){
			console.log("new build for "+ err || foundapp);
			if(err) next(err);
			else if(foundapp) res.view({app:foundapp});
		});
	},

	'createbuild': function(req, res, next)
	{
		var uploadDir = './assets/uploads/';
		var formidable = require('formidable');
	    var form = new formidable.IncomingForm({
	        uploadDir: uploadDir,
	        keepExtensions: true
	    });

		form.parse(req, function(err, fields, files){
		if(err || !files.url){
			var uploadError = [{
				error: 'You must upload ipa file'
			}]
			req.session.flash = {err: uploadError}
			res.redirect('/app/newbuild/'+ fields.owner);
			return ;
		}

		if(!fields.owner || !fields.version){
			req.session.flash = {err: [{name: 'missingValues', message: 'App ID and version number associated with this build couldnot be found'}]}
			res.redirect('/app/newbuild/'+fields.owner);
			return ;
		}

		var url;
		if(files.url.size) {
			url =  files.url.path.replace(/[^\/][^\/.]*\//,'/');
		}

		var buildObj = {
			version: fields.version,
			detail: fields.detail,
			owner: fields.owner,
			url: url
		}

		Build.create(buildObj, function buildCreated(err, build) {
			if (err) {
				var uploadError = [{
				error: 'Error in creating build. Please try again.'
			}]
				req.session.flash = {err: uploadError}
				res.redirect('/app/newbuild/'+fields.owner);
				return ;
			}
			// save file path
        	build.save(function (err, build) {
				res.redirect('app/showbuild/' + build.id);
				});
			});

		});
	},

create: function(req, res, next) 
{
	var uploadDir = './assets/uploads/';
	var formidable = require('formidable');
    var form = new formidable.IncomingForm({
        uploadDir: uploadDir,
        keepExtensions: true
    });

	form.parse(req, function(err, fields, files)
	{
		if(err || !fields.name || !fields.bundleid || !fields.detail) {
			var missingFieldsError = [{
				name: 'MissingFields',
				message: 'App Name, App bundle Id and App detail are required !'
			}]		
			req.session.flash = {err: missingFieldsError}
			res.redirect('/app/new/');
			return ;
		}

		var picture;
		if(files.picture.size) {
			picture =  files.picture.path.replace(/[^\/][^\/.]*\//,'/');
		}

		var appObj = {
			name: fields.name,
			bundleid: fields.bundleid,
			detail: fields.detail,
			picture: picture
		}
		console.log("files: " + JSON.stringify(files));

	// Create an App with the params sent from the form
	App.create(appObj, function appCreated(err, app)
	{
		if (err) {
			req.session.flash = {err: err}
			res.redirect('/app/new');
			return ;
		}

		if(files.picture.path)
			// app.picture = files.picture.path;
			app.save(function (err, app) {
			res.redirect('app/show/' + app.id);
			});
		});
	});
},

	// render the profile view (e.g. /views/show.ejs)
  show: function(req, res, next) {
    App.findOne(req.param('id')).populate('builds', {sort: 'createdAt DESC'}).exec(function(err, app) 
    {
      if (err) return next(err);
      if (!app) return next();
        res.view({
        	app:app
        });
    });
  },

  showbuild: function(req, res, next) {

  	Build.findOne(req.param('id')).populate('owner').exec(function(err, build){
  		if(err) return next(err);
  		if(!build) return next();
  		res.view({build:build})
  	});
  },

  editbuild: function(req, res, next) {

  	Build.findOne(req.param('id')).populate('owner').exec(function(err, build){
  		if(err) return next(err);
  		if(!build) return next();
  		res.view({build:build})
  	});
  },


  // render the edit view (e.g. /views/edit.ejs)
  edit: function(req, res, next) {

    // Find the app from the id passed in via params
    App.findOne(req.param('id'), function foundUser(err, app) {
      if (err) return next(err);
      if (!app) return next('App doesn\'t exist.');
      res.view({
        app: app,
      });
    });
  },

  'updatebuild': function(req, res, next)
	{
		var uploadDir = './assets/uploads/';
		var formidable = require('formidable');
	    var form = new formidable.IncomingForm({
	        uploadDir: uploadDir,
	        keepExtensions: true
	    });

		form.parse(req, function(err, fields, files){
		if(err){
			var uploadError = [{
				error: 'There was some error updating the build, try again later or create a new one.'
			}]
			req.session.flash = {err: uploadError}
			res.redirect('/app/editbuild/'+ fields.id);
			return ;
		}

		if(!fields.id || !fields.version){
			req.session.flash = {err: [{name: 'missingValues', message: 'App ID and version number associated with this build couldnot be found'}]}
			res.redirect('/app/editbuild/'+fields.id);
			return ;
		}

		var buildObj = {
			version: fields.version,
			detail: fields.detail,
		}

		if(files.url.size) {
			var buildObj = {
			version: fields.version,
			detail: fields.detail,
			url: files.url.path.replace(/[^\/][^\/.]*\//,'/')
			}
		}

		Build.update(fields.id, buildObj, function buildUpdated(err, build) {
			if (err) {
				var uploadError = [{
				error: 'Error in updating build. Please try again.'
			}]
				req.session.flash = {err: uploadError}
				res.redirect('/app/editbuild/'+fields.id);
				return ;
			}
			// save file path
        	build[0].save(function (err, build) {
				res.redirect('app/showbuild/' + build.id);
				});
			});

		});
},

  // process the info from edit view
update: function(req, res, next) {

    var uploadDir = './assets/uploads/';
	var formidable = require('formidable');
    var form = new formidable.IncomingForm({
        uploadDir: uploadDir,
        keepExtensions: true
    });

	form.parse(req, function(err, fields, files)
	{
		if(err) {
			var missingFieldsError = [{
				name: 'Server Error',
				message: 'Server Error, try again later'
			}]		
			req.session.flash = {err: missingFieldsError}
			res.redirect('/app/new/');
			return ;
		}

		var appObj = {
			name: fields.name,
			bundleid: fields.bundleid,
			detail: fields.detail,
		}

		console.log("new file " + JSON.stringify(files));

		if(files.picture.size) {
				appObj = {
					name: fields.name,
					bundleid: fields.bundleid,
					detail: fields.detail,
					picture: files.picture.path.replace(/[^\/][^\/.]*\//,'/')
				}
		}

	// Create an App with the params sent from the form
	App.update(fields.id,appObj, function appCreated(err, apps)
	{
		if (err) {
			req.session.flash = {err: err}
			res.redirect('/app/edit');
			return ;
		}

		if(files.picture.path)
			// app.picture = files.picture.path;
			apps[0].save(function (err, app) {
			res.redirect('app/show/' + fields.id);
			});
		});
	});
  },

  destroy: function(req, res, next) {

    App.findOne(req.param('id'), function appFound(err, app) {
      if (err) return next(err);

      if (!app) return next('App doesn\'t exist.');

      App.destroy(req.param('id'), function appDestroyed(err) {
        if (err) return next(err);

        // Inform other sockets (e.g. connected sockets that are subscribed) that this user is now logged in
        App.publishUpdate(app.id, {
          name: app.name,
          action: ' has been destroyed.'
        });

        // Let other sockets know that the user instance was destroyed.
        App.publishDestroy(app.id);

      });        

      res.redirect('back');

    });
  },

  destroybuild: function(req, res, next) {

    Build.findOne(req.param('id'), function appFound(err, build) {
      if (err) return next(err);

      if (!build) return next('Build doesn\'t exist.');

      Build.destroy(req.param('id'), function appDestroyed(err) {
        if (err) return next(err);

        // Inform other sockets (e.g. connected sockets that are subscribed) that this user is now logged in
        Build.publishUpdate(build.id, {
          name: build.version,
          action: ' has been destroyed.'
        });

        // Let other sockets know that the user instance was destroyed.
        Build.publishDestroy(build.id);

      });        

      	res.redirect('back');
		// res.redirect('app/show/' + app.id);

    });
  }
};

