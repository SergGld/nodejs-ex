//  OpenShift sample Node application
var express = require('express'),
    app = express(),
    morgan = require('morgan'),
    bodyParser = require("body-parser"),
    fs = require('fs');
var SelfReloadJSON = require('self-reload-json');
var urlencodedParser = bodyParser.urlencoded({
    extended: false
});
var parsedJSON = new SelfReloadJSON('./xd.json');
Object.assign = require('object-assign')

app.engine('html', require('ejs').renderFile);
app.use(morgan('combined'))

var port = process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080,
    ip = process.env.IP || process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0',
    mongoURL = process.env.OPENSHIFT_MONGODB_DB_URL || process.env.MONGO_URL,
    mongoURLLabel = "";

if (mongoURL == null && process.env.DATABASE_SERVICE_NAME) {
    var mongoServiceName = process.env.DATABASE_SERVICE_NAME.toUpperCase(),
        mongoHost = process.env[mongoServiceName + '_SERVICE_HOST'],
        mongoPort = process.env[mongoServiceName + '_SERVICE_PORT'],
        mongoDatabase = process.env[mongoServiceName + '_DATABASE'],
        mongoPassword = process.env[mongoServiceName + '_PASSWORD']
    mongoUser = process.env[mongoServiceName + '_USER'];

    if (mongoHost && mongoPort && mongoDatabase) {
        mongoURLLabel = mongoURL = 'mongodb://';
        if (mongoUser && mongoPassword) {
            mongoURL += mongoUser + ':' + mongoPassword + '@';
        }
        // Provide UI label that excludes user id and pw
        mongoURLLabel += mongoHost + ':' + mongoPort + '/' + mongoDatabase;
        mongoURL += mongoHost + ':' + mongoPort + '/' + mongoDatabase;

    }
}
var db = null,
    dbDetails = new Object();

var initDb = function (callback) {
    if (mongoURL == null) return;

    var mongodb = require('mongodb');
    if (mongodb == null) return;

    mongodb.connect(mongoURL, function (err, conn) {
        if (err) {
            callback(err);
            return;
        }

        db = conn;
        dbDetails.databaseName = db.databaseName;
        dbDetails.url = mongoURLLabel;
        dbDetails.type = 'MongoDB';

        console.log('Connected to MongoDB at: %s', mongoURL);
    });
};

app.get('/', function (req, res) {
    // try to initialize the db on every request if it's not already
    // initialized.
//    if (!db) {
//        initDb(function (err) {});
//    }
//    if (db) {
//        var col = db.collection('counts');
//        // Create a document with request IP and current time of request
//        col.insert({
//            ip: req.ip,
//            date: Date.now()
//        });
//        col.count(function (err, count) {
//            if (err) {
//                console.log('Error running count. Message:\n' + err);
//            }
//            res.render('index.html', {
//                pageCountMessage: collection,
//                dbInfo: dbDetails
//            });
//        });
//    } else {
        res.render('index.html', {
            pageCountMessage: 'Создать программу, которая отобразит список отфильтрованных по расширению файлов в заданной директории. Имя директории передается в качестве первого аргумента к программе, а расширение файла для фильтрации во втором аргументе.'
        });

});
app.get('/feed', function (req, res) {
    // try to initialize the db on every request if it's not already
    // initialized.
    
    var posts=parsedJSON.post;
    var htmlPost=start;
    for (var i=0;i<posts.length;i++){
        var name=posts[i].name;
        var message=posts[i].message;
        
        
        
        
        
        
        
        
        
        
        
        
        htmlPost+='<li>'+
            '  <div class="feed-container">'+
            '    <a href="/Dendy12312/"><img src="http://www.gravatar.com/avatar/9d9a6085137d62599f1861fb3533d8cd?s=256&d=http%3A%2F%2Ftrybootcamp.vitorfs.com%2Fstatic%2Fimg%2Fuser.png" class="user"></a>'+
            '    <div class="post">'+
            '      '+
            '        <span class="glyphicon glyphicon-remove remove-feed" title="Click to remove this feed"></span>'+
            '      '+
            '      <h3><a href="/Dendy12312/">'+name+'</a></h3>'+
            '      <p>'+message+'</p>'+
            '      <div class="interaction">      '+
            '          <a href="#" class="like">'+
            '            <span class="glyphicon glyphicon-thumbs-up"></span>'+
            '            <span class="text">Like</span>'+
            '            (<span class="like-count">0</span>)'+
            '          </a>'+
            '      </div>'+
            '    </div>'+
            '  </div>'+
            '</li>';
    }
    
    
    htmlPost+=end;        
    
    if (!db) {
        initDb(function (err) {});
    }
    if (db) {
        var col = db.collection('counts');
        // Create a document with request IP and current time of request
        col.insert({
            name: 'Сергей',
            message: 'привет'
        });
        col.count(function (err, count) {
            if (err) {
                console.log('Error running count. Message:\n' + err);
            }
            res.setHeader('content-type', 'text/html; charset=utf-8');
         res.write(htmlPost);  
        res.end();
        });
    } else {
        res.setHeader('content-type', 'text/html; charset=utf-8');
         res.write(htmlPost);  
        res.end();
    }
});
app.post("/send", urlencodedParser, function (request, response) {
    if (!request.body) return response.sendStatus(400); {
        console.log(request.body);
    }
    var name = request.body.name;
    var message = request.body.message;
    
    var obj = {
   post: []
};
    var posts=parsedJSON.post;
    for (var i=0;i<posts.length;i++){
        obj.post.push(posts[i]);
    }
    obj.post.push({name:name,message:message});
    var json = JSON.stringify(obj);
    fs.writeFile('xd.json', json, 'utf8');
    response.redirect("/feed")
    
    
    
    if (!db) {
        initDb(function (err) {});
    }
    if (db) {
        var col = db.collection('counts');
        // Create a document with request IP and current time of request
        col.insert({
            name: name,
            message: message
        });
        col.count(function (err, count) {
            if (err) {
                console.log('Error running count. Message:\n' + err);
            }
            response.render('message.html', {
                nameRender: name,
                messageRender: message
            });
        });
    } else {
        response.render('message.html', {
            nameRender: null,
            messageRender: null
        });
    }
//    response.send(`${files}`);
});
app.post("/register", urlencodedParser, function (request, response) {
    if (!request.body) return response.sendStatus(400); {
        console.log(request.body);
    }
    var path = request.body.dir;
    var ext = request.body.ext;
    var files = [];
    fs.readdir(path, function (err, items) {
        for (var i = 0; i < items.length; i++) {
            if (items[i].split('.')[1] == ext)
                files.push(items[i]);
        }
        if (ext.length == 0) files = items;
        response.send(`${files}`);
    });
});
app.get('/pagecount', function (req, res) {
    // try to initialize the db on every request if it's not already
    // initialized.
    if (!db) {
        initDb(function (err) {});
    }
    if (db) {
        db.collection('counts').count(function (err, count) {
            res.send('{ pageCount: ' + count + '}');
        });
    } else {
        res.send('{ pageCount: -1 }');
    }
});

initDb(function (err) {
    console.log('Error connecting to Mongo. Message:\n' + err);
});
app.listen(port, ip);
console.log('Server running on http://%s:%s', ip, port);

module.exports = app;
var start='<head>'+
'  <meta charset="utf-8">'+
'  <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">'+
'  <title>Welcome to OpenShift</title>'+
'<link href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0-beta.2/css/bootstrap.min.css" rel="stylesheet">'+
'<style>'+
'    ul.stream {'+
'  margin: 0;'+
'  padding: 0;'+
'}'+
''+
'ul.stream li {'+
'  list-style: none;'+
'  border-bottom: 1px solid #eeeeee;'+
'  padding: 1em 0;'+
'}'+
''+
'ul.stream li:last-child {'+
'  border-bottom: none;'+
'}'+
''+
'ul.stream li a img.user {'+
'  width: 60px;'+
'  border-radius: 100px;'+
'  float: left;'+
'}'+
''+
'ul.stream li div.post {'+
'  margin-left: 60px;'+
'  padding: 0 0 0 1.2em;'+
'  overflow-x: auto;'+
'}'+
''+
'ul.stream li div.post h3 {'+
'  font-size: 1em;'+
'  margin: 0;'+
'  margin-bottom: .2em;'+
'}'+
''+
'ul.stream li div.post h3 small {'+
'  margin-left: .3em;'+
'  font-size: .8em;'+
'}'+
''+
'ul.stream li div.post p {'+
'  margin: 0;'+
'}'+
''+
'ul.stream li div.post div.interaction {'+
'  padding-top: .2em;'+
'}'+
''+
'ul.stream li div.post div.interaction a {'+
'  margin-right: .6em;'+
'  font-size: .8em;'+
'}'+
''+
'.stream-update {'+
'  text-align: center;'+
'  border-bottom: 1px solid #eeeeee;'+
'  display: none;'+
'}'+
''+
'.stream-update a {'+
'  display: block;'+
'  padding: .6em 0;'+
'  background-color: #f5f8fa;'+
'}'+
''+
'.stream-update a:hover {'+
'  text-decoration: none;'+
'  background-color: #e1e8ed;'+
'}'+
''+
'.compose {'+
'  display: none;'+
'  border-bottom: 1px solid #eee;'+
'  padding-left: 15px;'+
'  padding-right: 15px;'+
'}'+
''+
'.compose h2 {'+
'  font-size: 1.4em;'+
'}'+
''+
'.comments {'+
'  margin-top: .6em;'+
'  display: none;'+
'}'+
''+
'.comments ol {'+
'  margin: .8em 0 0;'+
'  padding: .2em 0;'+
'  background-color: #f4f4f4;'+
'  border-radius: 3px;'+
'  overflow-x: auto;'+
'}'+
''+
'.comments ol li {'+
'  list-style: none;'+
'  padding: 0;'+
'}'+
''+
'.comments ol li img.user-comment {'+
'  width: 35px;'+
'  border-radius: 4px;'+
'  float: left;'+
'  margin-left: 10px;'+
'}'+
''+
'.comments ol li div {'+
'  margin-left: 45px;'+
'  padding: 0 .8em;'+
'  font-size: .9em;'+
'}'+
''+
'.comments ol li {'+
'  padding: .6em .6em .6em 0;'+
'  border-bottom: none;'+
'}'+
''+
'.comments ol li h4 {'+
'  margin: 0;'+
'  margin-left: 45px;'+
'  padding: 0 0 .2em .8em;'+
'  font-size: .9em;'+
'}'+
''+
'.comments ol li h4 small {'+
'  margin-left: .3em;'+
'}'+
''+
'.empty {'+
'  margin: 0 .8em;'+
'  font-size: .9em;'+
'}'+
''+
'.load {'+
'  text-align: center;'+
'  padding-top: 1em;'+
'  border-top: 1px solid #eeeeee;'+
'  display: none;'+
'  padding: 15px 0;'+
'}'+
''+
'.loadcomment {'+
'  text-align: center;'+
'}'+
''+
'.remove-feed {'+
'  color: #bbbbbb; '+
'  font-size: .8em; '+
'  padding-top: .2em;'+
'  float: right;'+
'  cursor: pointer;'+
'}'+
''+
'.remove-feed:hover {'+
'  color: #333333;'+
'}'+
''+
'.panel-feed {'+
'  margin-top: 20px;'+
'}'+
''+
'.panel-feed .panel-body {'+
'  padding: 0;'+
'}'+
''+
'.feed-container {'+
'  padding-left: 15px;'+
'  padding-right: 15px;'+
'}'+
'    @import url(https://fonts.googleapis.com/css?family=Audiowide);'+
'    body{'+
'        padding-left:60px;'+
'        background-color:cornsilk;'+
'    }'+
'header .navbar-brand {'+
'  font-size: 1.4em;'+
'  font-weight: 200;'+
'  font-family: "Audiowide", cursive;'+
'}'+
''+
'main .container {'+
''+
'}'+
''+
'.page-header {'+
'  margin: 0;'+
'}'+
''+
'.page-header h1 {'+
'  margin: 0;'+
'  font-weight: 100;'+
'  font-size: 2em;'+
'}'+
''+
'.no-data {'+
'  text-align: center;'+
'  padding: 1em 0;'+
'}'+
''+
'#notifications {'+
'  font-size: 1.5em;'+
'  padding: 13px;'+
'  color: #dddddd;'+
'}'+
''+
'#notifications.new-notifications {'+
'  color: #428bca;'+
'}'+
''+
'.popover {'+
'  max-width: 350px;'+
'  width: 350px;'+
'}'+
''+
'.popover ul {'+
'  padding: 0;'+
'  margin: 0;'+
'}'+
''+
'.popover ul li {'+
'  list-style: none;'+
'  border-bottom: 1px solid #eeeeee;'+
'  padding: .4em 0;'+
'}'+
''+
'.popover ul li:last-child {'+
'  border-bottom: none;'+
'}'+
''+
'.popover ul li .user-picture {'+
'  width: 45px;'+
'  float: left;'+
'}'+
''+
'.popover ul li p {'+
'  font-size: .9em;'+
'  padding: 0 0 0 .6em;'+
'  margin-left: 45px;'+
'  margin-bottom: 0;'+
'}'+
''+
'.markdown {'+
'  margin-bottom: .8em;'+
'}'+
'</style>'+        
'</head>'+
'<body>'+
'<div class="container">'+
'    <div class="row">'+
'    <div class="col-md-6 col-md-offset-3">'+
''+
''+
'      <div class="panel panel-default panel-feed">'+
'        <div class="panel-heading">'+
'          <h3 class="panel-title">Последние сообщения</h3>'+
'        </div>'+
'        <div class="panel-body">'+
'          <ul class="stream">';
var end='<div class="compose composing" style="display: block;">'+
'            <h2>Напишите что-нибудь</h2>'+
'            <form role="form" id="compose-form" action="/send" method="post">'+
'              <input type="hidden" name="csrfmiddlewaretoken" value="7St35wxJ3BHZXuTdxf1EA34CuNyZnNPR" autocomplete="off">'+
'              <input type="hidden" name="last_feed" autocomplete="off">'+
'              <div class="form-group">'+
'                  <label>Ваше имя</label>'+
'                  <input style="width:300px;" class="form-control" type="text" name="name" />'+
'                  <br>'+
'                <textarea class="form-control" rows="3" name="message" autocomplete="off"></textarea>'+
' </div>'+
'<div class="form-group">'+
'<button type="submit" class="btn btn-primary btn-post">'+
'<span class="glyphicon glyphicon-send"></span>Отправить'+
'</button>'+
'</div>'+
'</form>'+
'</div>';