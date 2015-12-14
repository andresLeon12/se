var app = angular.module('secreto', [])
var url_server = 'http://10.42.0.1:8080/';

/* Controlador de login */
app.controller('loginController', function($scope, $http){
	localStorage.removeItem('usuario')
	$scope.datos = {}
	/* Funcion de login */
	$scope.login = function(){
		$http.get(url_server+'login', { params : {correo: $scope.datos.correo, clave: $scope.datos.clave}}).
			success(function(datos){
				if(!datos.type){
					$scope.mensaje = datos.data;
					$("#error").empty();
					$("#error").append("<div class='yellow center-align'><i class='mdi-alert-warning'></i> No estas autorizado para ingresar.</div>");
					$("#error").css('color', '#d50000');
					
				}else{
					if(typeof(Storage) !== "undefined") {
						// Alamcenamos la información del usuario
					    localStorage.setItem("usuario", JSON.stringify(datos.data));
					} 
					// Redirigimos a la pagina correspondiente segun el tipo de usuario
					if(datos.data.puesto_nombre === "Empleado"){
						window.location.href = 'pages_empleado/empleado.html'
					}else if (datos.data.puesto_nombre === "Directivo") {
						window.location.href = 'pages_directivo/directivo.html'
					}else if (datos.data.puesto_nombre === "Secretario") {
						window.location.href = 'pages_secretario/secretario.html'
					}else if (datos.data.puesto_nombre === "gerente") {
						alert("Gerente")
					}
				}
			}).
			error(function(data, status, headers, config){
				$("#error").empty();
				$("#error").html("<div class='yellow center-align'><i class='mdi-alert-warning'></i> Lo sentimos ha ocurrido un error al procesar su información. Inténtelo nuevamente.</div>");
				$("#error").css('color', '#d50000');
				$scope.mensaje = "Lo sentimos ha ocurrido un error al procesar su información. Inténtelo nuevamente."
			})
	}
});