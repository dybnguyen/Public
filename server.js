var net = require('net');
var proxy_protocol = require('node-proxy-protocol');

var response = 'HTTP/1.1 200 OK\n\
Content-Type: text/html\n\
\n\
<!doctype html>\n \
<html lang="en">\n \
<head>\n \
  <meta charset="utf-8" />\n \
  <title>New Feautre: Proxy Protocol Support for Elastic Load Balancing</title>\n \
  <link rel="stylesheet" href="http://code.jquery.com/ui/1.10.3/themes/smoothness/jquery-ui.css" />\n \
  <script src="http://code.jquery.com/jquery-1.9.1.js"></script>\n \
  <script src="http://code.jquery.com/ui/1.10.3/jquery-ui.js"></script>\n \
  <script>\n \
  $(function() {\n \
    $( "#dialog" ).dialog({ width: 500, top: 200 });\n \
  });\n \
  </script>\n \
</head>\n \
<body>\n \
<div id="dialog" title="Connection Details" style="width:400px">\n \
  <p><b>Source IP:</b> {SOURCE_ADDRESS}</p>\n \
  <p><b>Source Port:</b> {SOURCE_PORT}</p>\n \
  <p><b>ELB IP:</b> {PROXIED_BY}</p>\n \
</div>\n \
</body>\n \
</html>';

// Create a TCP server on 8080 and listen for connects
net.createServer(function(socket) {
	var clientDetails = {};
	proxy_protocol.parse(socket, function(error, obj) {
		if (error) {
			clientDetails.sourceAddress = socket.remoteAddress;
			clientDetails.sourcePort = socket.remotePort;
			clientDetails.proxiedBy = "Not detected";
			clientDetails.proxiedPort = "";
		} else {
			console.log(obj);
			clientDetails.sourceAddress = obj.srca;
			clientDetails.sourcePort = obj.srcp;
			clientDetails.proxiedBy = socket.remoteAddress;
			clientDetails.proxiedPort = socket.remotePort;
		}
		socket.end(response.replace("{SOURCE_ADDRESS}", clientDetails.sourceAddress)
							.replace("{SOURCE_PORT}", clientDetails.sourcePort) 
							.replace("{PROXIED_BY}", clientDetails.proxiedBy));
	});
}).listen(8080);
