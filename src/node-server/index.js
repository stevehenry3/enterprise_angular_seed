var express = require('express'),
	path = require('path');
var port = process.env.PORT || 3000;

var app = express();

//app.set("view options", {layout: false});
app.engine('html', require('ejs').renderFile);
app.set('views', path.join(__dirname, '../../build'));
app.use(express.static(path.join(__dirname, '../../build')));
app.use(express.static(path.join(__dirname, '../../build/js')));
app.use(express.static(path.join(__dirname, '../../build/templates')));
app.use(express.static(path.join(__dirname, '../../build/assets')));

app.get('/', function(req, res) {
	res.render('index.html');
	
});

app.get('/api/customer', function(req, res) {
	var cus = { name: 'Jim Jefferies', age: 40, job: 'Comedian' };
	res.send(cus);
});

app.listen(port, function() {
	console.log('Express server listening on port ' + port);
	console.log('\n__dirname = ' + __dirname +
	'\nprocess.cwd = ' + process.cwd());
});