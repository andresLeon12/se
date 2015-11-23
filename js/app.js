var socket = io.connect('http://192.168.1.102:3000');
$(document).ready(function(){
	$('ul.tabs').tabs();
	socket.emit("conectado")
});
$('#myTabs a').click(function (e) {
  	e.preventDefault()
  	$(this).tab('show')
});