module.exports = {
	'index' : function(req, res){
		App.find(function foundApps(err, appslist){
			res.view('homepage',{
				apps: appslist
			});
		});
	}
}