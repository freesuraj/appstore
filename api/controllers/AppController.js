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
		// We're using Multiparty to parse a form that has both parts and text fields
	  var multiparty = require('multiparty');
	  var form = new multiparty.Form();

		form.parse(req, function(err, fields, files){
		if(err){
			req.session.flash = {err: err}
			res.redirect('/app/newbuild/'+fields.appid);
			return ;
		}
		var buildObj = {
			version: fields.version,
			detail: fields.appdetail,
			owner: fields.appid
		}

		if(!fields.appid){
			req.session.flash = {err: [{name: 'appId missing', message: 'App ID associated with this build couldnot be found'}]}
			res.redirect('/app/newbuild/'+fields.appid);
			return ;
		}

		Build.create(buildObj, function buildCreated(err, build) {
			if (err) {
				req.session.flash = {err: err}
				res.redirect('/app/newbuild/'+fields.appid);
				return ;
			}
			// Upload the app build
        	var Up = require("./FileController");
			if(req.files)
			{
				res.setTimeout(6000);
				Up.upload(req,'appbuild', function(err, filesJson)
				{
					if(!err)
					{
						fullDir = filesJson[0].fd;
						build.url =  "/uploads/"+require('path').basename(fullDir);
						var plistDir =   require('path').dirname(fullDir)+"/test.plist";
						writeplist.writePlist(plistDir,"build.app.bundleid",build.version, build.url,"build.app.name",function(err, data){
							if(!err) build.plist = data;
						});
					}
					build.save(function (err, build) {
						res.redirect('app/showbuild/' + build.id);
					});
				});
			}
			else 
			{
				build.save(function (err, build) {
				res.redirect('app/showbuild/' + build.id);
				});
			}
		});

		});
	},

	create: function(req, res, next) 
	{
		var appObj = {
			name: req.param('appName'),
			detail: req.param('appDetail'),
			bundleid: req.param('appBundleId'),
		};

		if(!appObj.name || !appObj.detail || !appObj.bundleid){
			var missingFieldsError = [{
				name: 'missingFields',
				message: 'App Name, App bundle Id and App detail are required !'
			}]

			req.session.flash = {err: missingFieldsError}
			res.redirect('/app/new');
			return ;
		}

		// Create an App with the params sent from the form
		App.create(appObj, function appCreated(err, app)
		{
			if (err) {
				req.session.flash = {err: err}
				res.redirect('/app/create');
				return ;
			}

			if(req.files)
			{
				var Up = require("./FileController");
				Up.upload(req,'picture', function(err, filesJson)
				{
					if(!err)
					{
						fullDir = filesJson[0].fd;
						app.picture =  "/uploads/"+require('path').basename(fullDir);
					}
					app.save(function (err, app) {
						res.redirect('app/show/' + app.id);
					});
				});
			}
			else 
			{
				app.save(function (err, app) {
				res.redirect('app/show/' + app.id);
				});
			}
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
		// We're using Multiparty to parse a form that has both parts and text fields
	  var multiparty = require('multiparty');
	  var form = new multiparty.Form();

		form.parse(req, function(err, fields, files){
			var buildObj, buildId;
		if(err){
			buildObj = {
			version: req.param('version'),
			detail: req.param('appdetail'),
			};
			buildId = req.param('buildid');
		}
		else {
			buildObj = {
			version: fields.version,
			detail: fields.appdetail,
			}
			buildId = fields.buildid;
		} 

		if(!buildId){
			return res.badRequest();
		}

		Build.update(fields.buildid, buildObj, function buildCreated(err, build) {
			if (err) {
				console.log("the error" + err);
				return res.send({error: "error"});
			}
			// Upload the app build
        	var Up = require("./FileController");
			if(req.files)
			{
				res.setTimeout(6000);
				Up.upload(req,'appbuild', function(err, filesJson)
				{
					console.log("build upload result "+ err || filesJson);
					if(!err)
					{
						fullDir = filesJson[0].fd;
						build[0].url =  "/uploads/"+require('path').basename(fullDir);
						var plistDir =   require('path').dirname(fullDir)+"/test.plist";
						writeplist.writePlist(plistDir,"build.app.bundleid",build.version, build.url,"build.app.name",function(err, data){
							if(!err) build[0].plist = data;
						});
					}
					build[0].save(function (err, build) {
						res.redirect('app/showbuild/' + build.id);
					});
				});
			}
			else 
			{
				build[0].save(function (err, build) {
				res.redirect('app/showbuild/' + build.id);
				});
			}
		});

		});
	},

  // process the info from edit view
  update: function(req, res, next) {

      var appObj = {
        name: req.param('appName'),
        detail: req.param('appDetail'),
        bundleid: req.param('appBundleId')
      }

    console.log("update request..");

    App.update(req.param('appid'), appObj, function appUpdated(err, app) {
      if (err) {
      	console.log("error in update "+ err);
        return res.redirect('/app/edit/' + req.param('appid'));
      }
      else {
      	// Upload the app icon if it's changed
      	if(req.files)
      	{
			console.log("upload coming.." + req.file('picture'));
        	var Up = require("./FileController");
			if(req.file('picture'))
			{
				res.setTimeout(6000);
				Up.upload(req,'picture', function(err, filesJson)
				{
					if(!err)
					{
						fullDir = filesJson[0].fd;
						app[0].picture =  "/uploads/"+require('path').basename(fullDir);
					}
					app[0].save(function (err, app) {
						res.redirect('app/show/' + app.id);
					});
				});
			}
			else 
			{
				app[0].save(function (err, app) {
				res.redirect('app/show/' + app.id);
				});
			}
		}
      }
      
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

