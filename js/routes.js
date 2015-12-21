var app = angular.module('secreto', [])
var url_server = 'http://192.168.1.103:8080/';

/* Controlador de login */
app.controller('loginController', function($scope, $http){
	localStorage.removeItem('usuario')
	$scope.datos = {}
	/* Funcion de login */
	$scope.login = function(){
		$http.get(url_server+'login', { params : {correo: $scope.datos.correo, clave: $scope.datos.clave, empresa : $scope.datos.empresa}}).
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
					    localStorage.setItem("empresa", $scope.datos.empresa);
					} 
					$http.get(url_server+"puesto/buscar/"+datos.data.puesto).success(function(response) {
			            if(response.type) { // Si nos devuelve un OK la API...
			                var data = response.data[0];
			                if(data.nivel === 3){
								window.location.href = 'pages_empleado/empleado.html'
							}else if (data.nivel === 2) {
								window.location.href = 'pages_directivo/directivo.html'
							}else if (data.nivel === 4) {
								window.location.href = 'pages_secretario/secretario.html'
							}
			            }
			        });
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