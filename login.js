var mysql = require('mysql');
var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var path = require('path');

const http = require("http");
const fs = require("fs");

var connection = mysql.createConnection({
	host     : 'localhost',
	user     : 'thipwara',
	password : 'Mint2906',
	database : 'nodelogin'
});
/*var connection = mysql.createConnection({
	host     : process.env.MYSQL_HOST,
	user     : process.env.MYSQL_HOST,
	password : process.env.MYSQL_HOST,
	database : process.env.MYSQL_HOST
});*/

var app = express();
app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));
app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());

app.get('/', function(request, response) {
	response.sendFile(path.join(__dirname + '/login.html'));
});

app.get('/login.html', function(request, response) {
	response.sendFile(path.join(__dirname + '/login.html'));
});

/*app.post('/auth', function(request, response) {
	var username = request.body.username;
	var password = request.body.password;
	if (username && password) {
		connection.query('SELECT * FROM accounts WHERE username = ? AND password = ?', [username, password], function(error, results, fields) {
			if (results.length > 0) {
				request.session.loggedin = true;
				request.session.username = username;
				response.redirect('/home');
			} else {
				response.send('Incorrect Username and/or Password!');
			}			
			response.end();
		});
	} else {
		response.send('Please enter Username and Password!');
		response.end();
	}
});*/

app.post('/add', function (request, response) {
	var book={
		"isbn":request.body.isbn,
		"title":request.body.title,
		"author":request.body.author,
		"publisher":request.body.publisher
	  }
	  connection.query('INSERT INTO book SET ?',book, function (error, results, fields){
		
		if (error) {
			response.send("<style>h2{color: red;font-family: courier;padding-top: 200px;patext-align: center;}</style><h2>ISBN number already exist, Please check ISBN and try again.</h2>");
		  } 
		  else {
			
			  fs.readFile("add.html", function(err, data) {
				response.statusCode = 200;
				response.setHeader("Content-Type","text/html");
				response.write(data);
				response.end();
				});
			
			}
	  })
});

app.post('/delete', function (request, response) {
	
	var title = request.body.title;
	var isbn = request.body.isbn;
	if (title && isbn) {
		connection.query('SELECT * FROM book WHERE isbn = ? AND title = ?', [isbn,title],function(error, results, fields){
		if(results.length > 0){
		connection.query('DELETE FROM book WHERE isbn = ? AND title = ?', [isbn,title], function(error, results, fields) {
			if (error) {
				response.send({
				  "code":400,
				  "failed":"error ocurred"
				})//;console.log(results)
			  } else{
				
				fs.readFile("delete.html", function(err, data) {
				  response.statusCode = 200;
				  response.setHeader("Content-Type","text/html");
				  response.write(data);
				  response.end();
				  });
			  
			  }
		})} else response.send('does not exit');
	});
	} else {
		response.send('Please enter ISBN and title !');
		response.end();
	}
});

app.post('/update', function (request, response) {
	
	var isbn = request.body.isbn;
	var title = request.body.title;
	var author = request.body.author;
	var publisher = request.body.publisher;
	if (isbn&&title&&author&&publisher) {
		connection.query('SELECT * FROM book WHERE isbn = ?', [isbn],function(error, results, fields){
		if(results.length > 0){
		connection.query('UPDATE book SET title = ?, author = ? ,publisher = ? WHERE isbn = ?', [title,author,publisher,isbn], function(error, results, fields) {
			if (error) {
				response.send({
				  "code":400,
				  "failed":"error ocurred"
				});console.log(results)
			  } else {
			
				fs.readFile("update.html", function(err, data) {
				  response.statusCode = 200;
				  response.setHeader("Content-Type","text/html");
				  response.write(data);
				  response.end();
				  });
			  
			  }
			})
		}else response.send('ISBN does not exit');
	}); 
	} else {
		response.send('Please enter book information!');
		response.end();
	}
});

app.post('/retrieve', function(request, response,results) {
	var title = request.body.title;
	if (title) {
		//var user = request.session.username;
	connection.query('SELECT * FROM book WHERE title = ?', [title],function(error, results, fields){
	if(results.length > 0){
	var output = '<!DOCTYPE html><html lang="en">';
    output += "<head><title>Book data</title><style>table, th, td{border: 1px solid black; text-align: center;}</style></head><body>";
    output += '<table><tr><th>ISBN</th><th>Title</th><th>Author</th><th>Publisher</th></tr>'
    var sql = 'SELECT isbn,title,author,publisher from book WHERE title = ?';
    connection.query(sql,[title], (err, data,results) => {
        if(err) throw err;
        console.log('Retrieve personal information...')
        data.forEach(book => {
            output += '<tr><td>' + book.isbn+ '</td>';
			output += '<td>' + book.title+ '</td>';
			output += '<td>' + book.author+ '</td>';
			output += '<td>' + book.publisher+ '</td></tr>';
        });//console.log(results.length);
        output += "</table></body></html>";
        response.send(title+'\'s book information'+output);
        response.end();
	})} response.send('The book is not available!')
})
		/*connection.query('SELECT * FROM accounts WHERE username = ? ', [username], function(error, results, fields) {
			if (results.length > 0) {
				request.session.username = username;
				response.redirect('/data');				
			} else {
				response.send('Incorrect Username');
			}		
			response.end();
		});*/
	} else {
		response.send('Please enter book title!');
		response.end();
	}
});


app.get('/home', function(request, response) {
	if (!request.session.loggedin) {
		response.send('Please login to view this page!');
		//response.send('Welcome back, ' + request.session.username + '!');
	} else {
		fs.readFile("signup.html", function(err, data) {
			response.statusCode = 200;
			response.setHeader("Content-Type","text/html");
			response.write(data);
			response.end();
			});
			/*response.redirect('/show');
			response.end();*/
	}
	//response.end();

});


app.get('/data', function(request, response) {
	response.send('Welcome back, ' + request.session.username + '!');
	
	/*response.send('Welcome back, ' + request.session.username + '!');
	var user = request.session.username;
	connection.query("SELECT email from accounts WHERE username = ?",[user],function(err,results,fields){
	if(err) throw err;
		console.log(results)
	})*/
})

app.get('/show', function(request, response) {
	//response.send('showData');
	var username = request.body.username;
	var password = request.body.password;
	connection.query('SELECT * FROM accounts WHERE username = ? AND password = ?', [username, password], function(error, results, fields) {
		response.send(results);
		response.end();
	})
});
app.listen(8080,function(){
	console.log('Server is running');
});