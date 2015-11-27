var url_server = 'http://192.168.1.101:8080/';
var socket = io.connect(url_server);

$(document).ready(function(){
	$('.button-collapse').sideNav({
	      menuWidth: 350, // Default is 240
	      edge: 'left', // Choose the horizontal origin
	      closeOnClick: true // Closes side-nav on <a> clicks, useful for Angular/Meteor
	    }
	);
	//socket.emit("conectado")
});
$('#myTabs a').click(function (e) {
  	e.preventDefault()
  	$(this).tab('show')
});


function nobackbutton(){
	
   window.location.hash="no-back-button";
	
   window.location.hash="Again-No-back-button" //chrome
	
   window.onhashchange=function(){window.location.hash="no-back-button";}
	
}

/* Controlador para secretario */
var app = angular.module('secreto', [])

app.controller('secretarioController', function($scope, $http){
	$scope.usuario = {}
	var usuario = localStorage.getItem("usuario")
	$scope.usuario = JSON.parse(usuario);
});