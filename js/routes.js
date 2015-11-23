var app = angular.module('secreto', []);
//var url_server = 'http://192.168.1.102:3000';
/* Controlador de login */
app.controller('loginController', function($scope, $http){
	$scope.datos = {}
	/* Funcion de login */
	$scope.login = function(){
		$http.get('http://192.168.1.102:3000/login', { params : {correo: $scope.datos.correo, clave: $scope.datos.clave}}).
			success(function(datos){
				alert("success")
				if(!datos.type){
					$scope.mensaje = datos.data;
					$("#error").empty();
					$("#error").append("No estas autorizado para ingresar.");
					$("#error").css('color', '#d50000');
					
				}else{
					alert("Exito")
					//alert(JSON.stringify(datos.data))
					/*window.location.href = '/profesor';
					$scope.mensaje = '';
					$scope.email = '';
					$scope.pass = '';*/
				}
			}).
			error(function(err){
				alert("Error "+err)
				$("#error").empty();
				$("#error").append("Lo sentimos ha ocurrido un error al procesar su información. Inténtelo nuevamente.");
				$("#error").css('color', '#d50000');
				$scope.mensaje = "Lo sentimos ha ocurrido un error al procesar su información. Inténtelo nuevamente."
			});
	}
});