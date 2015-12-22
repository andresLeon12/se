var url_server = 'http://159.203.128.165:8080/';
var socket = io.connect(url_server);

/* Controlador para secretario */
var app = angular.module('secreto', [])

app.directive('fileModel', ['$parse', function ($parse) {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            var model = $parse(attrs.fileModel);
            var modelSetter = model.assign;
            
            element.bind('change', function(){
                scope.$apply(function(){
                    modelSetter(scope, element[0].files[0]);
                });
            });
        }
    };
}]);

app.service('fileUpload', ['$http', function ($http) {
    this.uploadFileToUrl = function(nombre, file, uploadUrl){
        var fd = new FormData();
        fd.append('photo', file);
        fd.append('nombre', nombre)
        $http.post(uploadUrl, fd, {
            transformRequest: angular.identity,
            headers: {'Content-Type': undefined}
        })
        .success(function(response){
            if(response.type)
                $("#mensaje").html("Se ha subido el archivo")
            else
                $("#mensaje").html("Ocurrio un error al subir el archivo")
        })
        .error(function(){
            $("#mensaje").html("Ocurrio un error al subir el archivo")
        });
    }
}]);

app.controller('empleadoController', ['$scope', '$http', 'fileUpload', function($scope, $http, fileUpload){
	var usuario = localStorage.getItem("usuario")
	var empresa = localStorage.getItem("empresa")
	$scope.usuario = JSON.parse(usuario);
	$scope.tareas = {}
	$scope.personas = {}

	var edit = getUrlParameter('id');
	/* Llamamos a la función para obtener la lista de usuario al cargar la pantalla */
    if (edit == undefined) {
        total_tareas();
    }else{
        getTareaUnico();
    }
	

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
		        	total_tareas();
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

    $scope.entregable = function(filename, file) {
        if(filename == '' || file == undefined){
            $("#mensaje").html("Por favor seleccione el archivo y nombre.")
        }
        var uploadUrl = url_server+"guardar";
        fileUpload.uploadFileToUrl(filename, file, uploadUrl);
    }

    /* Método para obtener información de una tarea específica */
    function getTareaUnico() {
        $http.get(url_server+"tarea/find/"+edit).success(function(response) {
            if(response.type) { // Si nos devuelve un OK la API...
                $scope.tarea = response.data[0];
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
}]);
