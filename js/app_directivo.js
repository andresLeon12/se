var url_server = 'http://192.168.1.103:8080/';
var socket = io.connect(url_server);

/* Controlador para secretario */
var app = angular.module('secreto', [])

app.controller('directivoController', function($scope, $http){
	var usuario = localStorage.getItem("usuario")
	var empresa = localStorage.getItem("empresa")
	$scope.usuario = JSON.parse(usuario);
	$scope.acuerdos = {}
	$scope.personas = {}
	$scope.tarea = {}
	/* Obtenemos los parametros de la url */
    var edit = getUrlParameter('id');
    /* Llamamos a la función para obtener la lista de usuario al cargar la pantalla */
    if (edit == undefined) {
        total_acuerdos();
		//getEmpleados();
    }else{
        getAcuerdoUnico();
        getEmpleados();
    }

	/* Obtenemos a todos los empleados */
	function getEmpleados() {
		$http.get(url_server+"user/usuario/3/"+empresa).success(function(response) {
	        if(response.type) { // Si nos devuelve un OK la API...
	        	$scope.personas = response.data;
	        }
	    });
	}

	/* Método para obtener información de un acuerdo específico */
    function getAcuerdoUnico() {
        $http.get(url_server+"acuerdo/find/"+edit).success(function(response) {
            if(response.type) { // Si nos devuelve un OK la API...
                $scope.acuerdo = response.data[0];
                //lastUsuarioAcuerdo = $scope.acuerdo.ACUCPE
            }
        });
    }
	/* Funcion de escucha ante un nuevo acuerdo */
	socket.on("nuevo_acuerdo", function (data) {
		var myName = $("#nombre_usuario").val();
		if (myName == data.ACUCPE) {
			var numNotificaciones = parseInt($(".noti").text())
			numNotificaciones++;
			$(".noti").html(numNotificaciones)
			$("#noti").html(numNotificaciones)
			$("#nothing").empty();
			var htmlText = '<li><a href="acuerdo.html?id='+data._id+'"><i class="mdi-social-notifications"></i> '+data.ACUDES+'</a></li>'
			$("#notifications-dropdown").append(htmlText);
			Materialize.toast('Nuevo acuerdo asignado!', 4000)
			$http.get(url_server+"acuerdo/buscar/"+myName+"/"+empresa).success(function(response) {
		        if(response.type) { // Si nos devuelve un OK la API...
		        	total_acuerdos();
		        }
		    });
		};
	});

	/* Metodo para obtener la cantidad de acuerdos del usuario */
	function total_acuerdos(){
		var user = JSON.parse(usuario)
		var myName = user._id;
		$http.get(url_server+"acuerdo/buscar/"+myName+"/"+empresa).success(function(response) {
			if(response.type) { // Si nos devuelve un OK la API...
		        $scope.acuerdos = response.data;
		        var total_acuerdos = response.data.length;
		        $("#num-notifications").html(total_acuerdos);
		    }
		});
	}

	/* Método para agregar una tarea */
    $scope.nuevaTarea = function(){
    	$scope.tarea.empresa = empresa;
    	$http.post(url_server+"tarea/crear", $scope.tarea).success(function(response) {
            if(response.status === "OK") { // Si nos devuelve un OK la API...
            	socket.emit("nueva_tarea", response.data);
            	$("#mensaje").empty();
                $("#mensaje").append('<div class="chip">Tarea creada<i class="material-icons">Cerrar</i></div>');
                $("#mensaje").css('color', '#FFF');
                $(".card-reveal").fadeOut()
                $scope.tarea = {}; // Limpiamos el scope
                /*$("#error").empty();
                $("#error").append("<div class='green center-align'><i class='mdi-action-thumb-up'></i> Tarea creada satisfactoriamente.</div>");
                $("#error").css('color', '#FFF');
                $("#error").fadeIn()*/
            }
        });
    }

    function getUrlParameter(sParam) {
        var sPageURL = decodeURIComponent(window.location.search.substring(1)),
            sURLVariables = sPageURL.split('&'),
            sParameterName,
            i;

        for (i = 0; i < sURLVariables.length; i++) {
            sParameterName = sURLVariables[i].split('=');

            if (sParameterName[0] === sParam) {
                return sParameterName[1] === undefined ? true : sParameterName[1];
            }
        }
    };
});