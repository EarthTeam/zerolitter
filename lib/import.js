'use strict';
var mysqlClient     = require('./mysqlClient');
var fetchBags       = require('./mysqlFetchBags');
var log             = require('./log');
var fs = require('fs');
var CLIENT_ID           = "122f19ebf8e74331b869f907f1a29e18";
var URL      = "https://api.instagram.com/v1/media/shortcode/{media-id}?client_id=" + CLIENT_ID;

var urls = [ ];
fs.readFile('zerolitter.csv', function (err, data) {
	var lines = String(data).split("\n");
	console.log(lines.length);
	for (var i = 0; i < lines.length; i++) {
		var line = lines[i];
		var parts = line.split(",");
		if (parts.length == 9) {
			var link = parts[0];
			var thumbnail = parts[1];
			var lat = parts[2];
			var lon = parts[3];
			var caption = parts[4];
			var username = parts[5];
			var userpicture = parts[6];
			var userfullname = parts[7];
			var datetime = parts[8];
			var lp = link.split("/");
			urls.push(lp[lp.length - 2]);
		}
	}
	urls.splice(0, 4614 + 20 + 361);
	var num = 0;
	var failures = [ ];
	var doOne = function() {
		var qurl = urls.shift();
		var url = URL.replace("{media-id}", qurl);
		fetchBags.processBag(url, "zerolitter")
		  .then(function () {
		  	num++;
		  	log.info("proccessed " + num);
		  	doOne();
		  }).catch(function (err) {
		    log.error("failed: " + url);
		   	doOne();
		   	failures.push(url);
		  });
	};
	console.log(failures);
	doOne();
});

