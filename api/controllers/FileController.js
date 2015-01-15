/**
 * FileController
 *
 * @description :: Server-side logic for managing files
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

 function safeFilename(name) {
  name = name.replace(/ /g, '-');
  name = name.replace(/[^A-Za-z0-9-_\.]/g, '');
  name = name.replace(/\.+/g, '.');
  name = name.replace(/-+/g, '-');
  name = name.replace(/_+/g, '_');

  var dateFormat = require('dateformat');
  var dateString = dateFormat(new Date(), "yyyymmddhMMss");
  return (dateString+"-"+name);
}
 
function fileMinusExt(fileName) {
  return fileName.split('.').slice(0, -1).join('.');
}
 
function fileExtension(fileName) {
  return fileName.split('.').slice(-1);
}



module.exports = {

  /**
   * `FileController.upload()`
   *
   * Upload file(s) to the server's disk.
   */
  upload: function (req, filename, callback) {
    // e.g.
    // 0 => infinite
    // 240000 => 4 minutes (240,000 miliseconds)
    // etc.
    //
    // Node defaults to 2 minutes.
    // res.setTimeout(0);

  var inputFileName = req.file(filename)._files[0]["stream"]["filename"];
  var directory = '../../assets/uploads/';
    req.file(filename).upload({maxBytes: 1000000000, dirname: directory, saveAs:safeFilename(inputFileName)}, function done(err, uploadedFiles) {
      console.log("upload result " + err || uploadedFiles);
      callback(err, uploadedFiles);
    });

  },

  /**
   * `FileController.s3upload()`
   *
   * Upload file(s) to an S3 bucket.
   *
   * NOTE:
   * If this is a really big file, you'll want to change
   * the TCP connection timeout.  This is demonstrated as the
   * first line of the action below.
   */
  s3upload: function (req, filename, callback) {

    // e.g.
    // 0 => infinite
    // 240000 => 4 minutes (240,000 miliseconds)
    // etc.
    //
    // Node defaults to 2 minutes.
    // res.setTimeout(0);

    req.file(filename).upload({
      adapter: require('skipper-s3'),
      bucket: sails.config.aws.bucket,
      key: sails.config.aws.key,
      secret: sails.config.aws.secret
    }, function whenDone(err, uploadedFiles) {
      console.log("upload result " + err + uploadedFiles);
      callback(err, uploadedFiles);
    });
  },


  /**
   * FileController.download()
   *
   * Download a file from the server's disk.
   */
  download: function (req, res) {
    require('fs').createReadStream(req.param('path'))
    .on('error', function (err) {
      return res.serverError(err);
    })
    .pipe(res);
  }
};