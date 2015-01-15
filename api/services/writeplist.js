var plist1 = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>"
var plist2 = "\n"
var plist3 = "<plist version=\"1.0\">"
var plist4 = "<dict> \
				<key>items</key> \
				<array> \
					<dict> \
						<key>assets</key> \
				<array> \
					<dict> \
						<key>kind</key> \
						<string>software-package</string> \
						<key>url</key> \
						<string>";
// ipa url
var plist5 = "</string></dict> \
				</array> \
				<key>metadata</key> \
				<dict> \
				<key>bundle-identifier</key> \
				<string>"
// bundle id
var plist6 = "</string> \
			<key>bundle-version</key> \
			<string>"
// bundle version
var plist7 = "</string> \
			<key>kind</key> \
			<string>software</string> \
			<key>title</key> \
			<string>"
// app name
var plist8 = "</string> \
				</dict> \
				</dict> \
				</array> \
				</dict> \
				</plist>"

function writePlist(filename, bundleId, versionNo, ipaUrl, appName, callback)
{
	var fs = require('fs');
	fs.open(filename, 'w+', function(err, data) {
	if (err) {
    	console.log("ERROR !! " +err);
    	callback(err, null);
	}
	 else 
	{
		var textToAppend = plist1+"\n"+plist2+"\n"+plist3+"\n"+plist4+ipaUrl+"\n"+plist5+bundleId+"\n"+plist6+versionNo+"\n"+plist7+appName+"\n"+plist8;
		fs.writeFile(filename, textToAppend, function (err) {
  			callback(err, filename);
		});
	}
	});	
}

exports.writePlist = writePlist;