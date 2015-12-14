var url_server = 'http://192.168.1.103:8080/';
var socket = io.connect(url_server);

/* Controlador para secretario */
var app = angular.module('secreto', [])

app.controller('empleadoController', function($scope, $http){
	var usuario = localStorage.getItem("usuario")
	$scope.usuario = JSON.parse(usuario);
	$scope.tareas = {}
	$scope.personas = {}

	total_tarea();

	/* Funcion de escucha ante un nuevo acuerdo */
	socket.on("nueva_tarea", function (data) {
		var user = JSON.parse(usuario)
		var myName = user._id;
		if (myName == data.ACUCPE) {
			var numNotificaciones = parseInt($(".noti").text())
			numNotificaciones++;
			$(".noti").html(numNotificaciones)
			$("#noti").html(numNotificaciones)
			$("#nothing").empty();
			var htmlText = '<li><a href="tarea.html?id='+data._id+'"><i class="mdi-social-notifications"></i> '+data.ACUDES+'</a></li>'
			$("#notifications-dropdown").append(htmlText);
			Materialize.toast('Nueva tarea asignada!', 4000)
			$http.get(url_server+"tarea/buscar/"+myName).success(function(response) {
		        if(response.type) { // Si nos devuelve un OK la API...
		        	total_tarea();
		        }
		    });
		};
	});

	/* Metodo para obtener la cantidad de acuerdos del usuario */
	function total_tareas(){
		var user = JSON.parse(usuario)
		var myName = user._id;
		$http.get(url_server+"tarea/buscar/"+myName).success(function(response) {
			if(response.type) { // Si nos devuelve un OK la API...
		        $scope.tareas = response.data;
		        /*var total_acuerdos = response.data.length;
		        $("#num-notifications").html(total_acuerdos);*/
		    }
		})
	}

	/* Método para agregar una tarea */
    $scope.nuevoAcuerdo = function(){
    	$http.post(url_server+"tarea/crear", $scope.tarea).success(function(response) {
            if(response.status === "OK") { // Si nos devuelve un OK la API...
            	socket.emit("nueva_tarea", response.data);
                $scope.tarea = {}; // Limpiamos el scope
                $("#error").empty();
                $("#error").append("<div class='green center-align'><i class='mdi-action-thumb-up'></i> Tarea creada satisfactoriamente.</div>");
                $("#error").css('color', '#FFF');
                $("#error").fadeIn()
            }
        });
    }
});