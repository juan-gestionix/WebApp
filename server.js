var express = require('express');
var cors = require('cors');
var app = express();
var http = require('http');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var Guid = require('guid');
var fs = require("fs");
var port = process.env.port || 1337;

app.set('port', port);
app.set('views', __dirname, '/views');
app.set('view engine', 'html');
app.use(cors());
app.use(logger('dev'));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: false }));
app.use(cookieParser());
//app.use(express.session({ secret: 'secret', key: 'express.sid' }));
console.log(__dirname + '/public');
app.use(express.static(__dirname + '/public'));
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.get('/', function (req, res) {
    //res.sendfile(__dirname + '/index2.html');
    res.sendfile(__dirname + '/views/index.html');
});
//var corsOptions = {
//    origen: ' http://example.com ',
//    optionsSuccessStatus: 200 //  algunos navegadores antiguos (IE11, varios SmartTVs) estrangulador en 204   
//};
// routes for our api
// ==================================
// create our router
var router = express.Router();
// middleware to use for all requests
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});
router.route('/ask')
    .put(function (req, res) {
        var _guid = Guid.EMPTY; 
        listUsers.forEach(function (value, index) {
           //if (value.companyId == req.body.companyId) {
                var _guid = Guid.create();
                listAsks.push({ key: _guid, res: res });
                value.socket.emit('ask', { key: _guid, companyId: req.body.companyId, ask: req.body.ask, options: req.body.data, typecontrol: req.body.typecontrol, title: req.body.title });
                return;
            //}
        });
    });
router.route('/progressMigration')
    .put(function (req, res) {
        listUsers.forEach(function (value, index) {
            //console.log(req.query);
            //if (value.companyId == req.body.companyId) {
                value.socket.emit('progressMigration', { progress: req.body });
                return;
            //}
        });
        res.json({ status: 200, detail: 'Ok' });
    });
//register our routes
app.use('/api', router);
app.get('/*', function (req, res) {
    res.redirect(__dirname);
});//404
var server = http.createServer(app).listen(app.get('port'), function () {
    console.log('server listening on port ' + app.get('port'));
});
function isResponded(key) {
    var response = null;
    listAsks.forEach(function (value, index) {
        if (value.key == key && value.response != '') {
            response = value.response;
            listAsks.splice(index);
        }
    });
    return response;
}
//sockect
var io = require('socket.io').listen(server);
var listUsers = new Array();
var listAsks = new Array();

io.on('connection', function (socket) {
    socket.emit('connected', { status: 'user connected' });
    socket.on('suscription', function (data) {
        disconneted(socket, data.companyId);
        listUsers.push({ socket: socket, companyId: data.companyId });
    });
    socket.on('answer', function (data) {
        var _index = -1;
        listAsks.forEach(function (value, index) {
            if (value.key == data.key) {
                value.res.json({ status: data.status, detail: data.detail, companyId: data.companyId, ask: data.ask, answer: data.answer, response_repeat : data.response_repeat });
                _index = index;
                return;
            }
        });
        if (_index != -1) listAsks.splice(_index);
    });
    socket.on('disconnect', function () {
        socket.emit('disconnected', 'disconnected');
    });
});

function disconneted(socket, companyId) {
    var _index = -1;
    listUsers.forEach(function (value, index) {
        if (value.companyId == companyId) {
            _index = index;
            return;
        }
    });
    if (_index != -1) listUsers.splice(_index);
}

