var express = require('express'),
	path = require('path');

var app = express();

//app.set("view options", {layout: false});
app.engine('html', require('ejs').renderFile);
app.set('views', path.join(__dirname, './'));
app.use(express.static(path.join(__dirname, './')));

app.get('/', function(req, res) {
	res.render("index.html");
	
});

app.get('/api/customer', function(req, res) {
	var cus = { name: 'Jim Jefferies', age: 40, job: 'Comedian' };
	res.send(cus);
});

app.listen(3000);