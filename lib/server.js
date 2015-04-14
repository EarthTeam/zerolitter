var path            = require('path');
var engines         = require('consolidate');
var fs              = require('fs');
var path            = require('path');
var _               = require('underscore');
var express         = require('express');
var colors          = require('colors');
var fetchBags       = require('./mysqlFetchBags');
var mysqlClient     = require('./mysqlClient');
var log             = require('../lib/log');
var q               = require('q');

_port = 80;

log.info(("Configuring app to use port: " + _port).green);

var app = express();
app.set('root', process.cwd()); // Need this to find the project root directory

app.configure(function () {
  //app.use(express.favicon(app.get("root") + '/public/img/favicon.ico'));
  app.use('/node_modules',  express.static(app.get("root") + '/node_modules'));
  app.use('/bower_components',  express.static(app.get("root") + '/bower_components'));
  app.use(express.static(app.get("root") + '/public'));
  app.use(express.json());       // to support JSON-encoded bodies
  app.use(express.urlencoded()); // to support URL-encoded bodies
});

// helper functions
// return sql script text
var getSql = function (fileName) {
    return String(fs.readFileSync(path.join(app.get('root'), 'sql', fileName + '.sql')));
  };

var mysqlHandler = function (query, res) {
    mysqlClient.query(query, function (rows, err) {
        if (err) {
            console.error(err);
            res.status(500).json({ error: err });
        }
        else {
            res.send(rows);
        }
    });
};

// application routes
app.get('/diagnostic', function (req, res) {
  res.send(200);
});

/** 
    route for setting up instagram subscription
    Keep turned off when not actively subscribing
**/
// app.get('/igrm/newbag', function(req, res) {
//     res.send(req.query['hub.challenge']);
//});

// route for downloading instagram images
app.post('/igrm/new', function (req, res) {
    res.send(200); // letting instagram off quickly
    log.info('Starting fetchBags');

    // get any tags that have been updated
    var tagUpdates = _.map(req.body, function (obj) {
        if (obj.object == "tag") {
            return obj.object_id;
        }
    });

    // process all new bags
    _.each(_.uniq(tagUpdates), function (tag) {
        fetchBags.fetch(tag, function (msg) {
            log.info(msg);
        });    
    });
});

/** 
    fetch all bags
    TODO: make this paging enabled
**/
app.get('/bags/all', function (req, res) {
    mysqlHandler(getSql('getAllBags'), res);
});

app.get('/bags/map', function (req, res) {
    var filter = "1";
    if (req.query.filter == "paper") {
        filter = "caption like '%#paper%'";
    } else if (req.query.filter == "plastic") {
        filter = "caption like '%#plastic%'";
    } else if (req.query.filter == "cigarettes") {
        filter = "caption like '%#cigarette%'";
    } else if (req.query.filter == "wrappers") {
        filter = "caption like '%wrapper%'";
    } else if (req.query.filter == "cheetos") {
        filter = "caption like '%cheeto%'";
    } else if (req.query.filter == "jackinthebox") {
        filter = "caption like '%jackinthebox%'";
    } else if (req.query.filter == "appleandeve") {
       filter = "caption like '%appleandeve%'";
    }
    var range = "1";
    if (req.query.since > 0) {
        range = "(unix_timestamp(now()) - created < " + req.query.since + ")";
    }
    mysqlClient.query(getSql('getBagsForMap').replace('$filter$', filter).replace('$range$', range), function (rows, err) {
        if (err) {
            console.error(err);
            res.status(500).json({ error: err });
        }
        else {
            mysqlClient.query("select count(*) from bagsintrees.photos where (" + filter + ") and (" + range + ");", function (countRows, err) {
                res.send({ "results": rows, "count": countRows[0]['count(*)']});
            });
        }
    });
});

// return top taggers
app.get('/user/top', function (req, res) {
    mysqlHandler(getSql('topTaggers'), res);
});

// user data
app.get('/user/:id', function (req, res) {    
    mysqlHandler(getSql('getSingleUser').replace('$id$', req.params.id), res);
});

// user bags
app.get('/user/bags/:id', function (req, res) {
    mysqlHandler(getSql('getAllBagsByUser').replace('$id$', req.params.id), res);
});

// details for a specific bag
app.get('/bags/one/:id', function (req, res) {
    mysqlClient.promiseQuery(getSql('getSingleBag').replace('$id$', req.params.id))
    .then(function (data) {
        if (!data) {
            var errMsg = 'Get One Bag query for id ' + req.params.id + ' returned, but with undefined rows.';
            console.error(errMsg);
            res.status(500).json({ error: errMsg});
        }
        mysqlClient.promiseQuery(getSql('getCommentsByBag').replace('$id$', req.params.id))
            .then(function (comments) {
                var results = {photo: data[0], comments: comments}
                res.send(results);
            })
            .catch(function (err) {
              console.error(err);
              res.status(500).json({ error: err });
            });
    })
    .catch(function (err) {
        console.error(err);
        res.status(500).json({ error: err });
    });
});


//The 404 Route (ALWAYS Keep this as the last route)
app.get('*', function (req, res){
    res.redirect('/#/404');
});

var server = app.listen(_port, function () {
    log.info(('#BagsInTrees now listening to the rustle of plastic on port ' + server.address().port).green);
});
