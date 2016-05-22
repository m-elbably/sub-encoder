var http = require('http'),
    fs = require("fs"),
    path = require('path');

function handleRequest(req, res){
    var fPath = path.join(__dirname , 'public/view/index.html');
    var data = fs.readFileSync(fPath, 'utf8');
    res.writeHead(200, {"Content-Type": "text/html"});
    res.end(data);
}

const PORT=3000; 
var server = http.createServer(handleRequest);
server.listen(PORT);
