var app = angular.module('secreto', [])
//var url_server = 'http://192.168.1.102:3000';
/* Controlador de login */
app.controller('loginController', function($scope, $http){
	$scope.datos = {}
	/* Funcion de login */
	$scope.login = function(){
		$http.get('http://192.168.1.102:8080/login', { params : {correo: $scope.datos.correo, clave: $scope.datos.clave}}).
			success(function(datos){
				if(!datos.type){
					$scope.mensaje = datos.data;
					$("#error").empty();
					$("#error").append("<div class='yellow center-align'><i class='mdi-alert-warning'></i> No estas autorizado para ingresar.</div>");
					$("#error").css('color', '#d50000');
					
				}else{
					// Redirigimos a la pagina correspondiente segun el tipo de usuario
					if(datos.data.puesto === "empleado"){
						alert("Empleado")
					}else if (datos.data.puesto === "director") {
						alert("Director")
					}else if (datos.data.puesto === "secretario") {
						alert("Secretario")
					}else if (datos.data.puesto === "gerente") {
						alert("Gerente")
					}
					/*window.location.href = '/profesor';
					$scope.mensaje = '';
					$scope.email = '';
					$scope.pass = '';*/
				}
			}).
			error(function(data, status, headers, config){
				alert("error "+data+" status "+status+" headers "+headers+ " config "+JSON.stringify(config))
				$("#error").empty();
				$("#error").html("<div style='padding: 15%' class='yellow'><i class='mdi-alert-warning'></i> Lo sentimos ha ocurrido un error al procesar su información. Inténtelo nuevamente.</div>");
				$("#error").css('color', '#d50000');
				$scope.mensaje = "Lo sentimos ha ocurrido un error al procesar su información. Inténtelo nuevamente."
			})
	}
});