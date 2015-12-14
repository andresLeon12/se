var url_server = 'http://192.168.1.103:8080/';
var socket = io.connect(url_server);

/* Controlador para secretario */
var app = angular.module('secreto', [])

app.controller('secretarioController', function($scope, $http){
    $scope.usuario = {}
	$scope.directivos = {}
	$scope.acuerdoN = {}
	$scope.acuerdos = {}
    $scope.acuerdo = {}
    var lastUsuarioAcuerdo // variable para saber que usuario tiene a cargo un acuerdo

	var usuario = localStorage.getItem("usuario")
	$scope.usuario = JSON.parse(usuario);
    /* Obtenemos los parametros de la url */
    var edit = getUrlParameter('id');
    /* Llamamos a la función para obtener la lista de usuario al cargar la pantalla */
    if (edit == undefined) {
        getDirectivos();
        getAcuerdos();
    }else{
        getDirectivos();
        getAcuerdoUnico();
    }

	/* Obtenemos a todos los directivos */
	function getDirectivos() {
		$http.get(url_server+"user/usuario/Directivo").success(function(response) {
	        if(response.type) { // Si nos devuelve un OK la API...
	        	$scope.directivos = response.data;
	        }
	    });
	}
	
    /* Obtenemos la lista de acuerdos */
    function getAcuerdos() {
    	$http.get(url_server+"acuerdo/listar").success(function(response) {
	        if(response.status == 'OK') { // Si nos devuelve un OK la API...
	        	$scope.acuerdos = response.data;
	        	if($scope.acuerdos.length == 0){
					$("#mensaje").empty();
					$("#mensaje").append('<div class="chip">Aún no hay acuerdos<i class="material-icons">Cerrar</i></div>');
					$("#mensaje").css('color', '#d50000');
				}else{
	                $("#mensaje").empty();
	            }
	        }
	    });
    }
    
    /* Método para obtener información de un acuerdo específico */
    function getAcuerdoUnico() {
        $http.get(url_server+"acuerdo/find/"+edit).success(function(response) {
            if(response.type) { // Si nos devuelve un OK la API...
                $scope.acuerdo = response.data[0];
                lastUsuarioAcuerdo = $scope.acuerdo.ACUCPE
            }
        });
    }

    /* Método para agregar un acuerdo */
    $scope.nuevoAcuerdo = function(){
    	$http.post(url_server+"acuerdo/crear", $scope.acuerdoN).success(function(response) {
            if(response.status === "OK") { // Si nos devuelve un OK la API...
            	socket.emit("nuevo_acuerdo", response.data);
                $("#mensaje").empty();
                $("#mensaje").append('<div class="chip">Acuerdo agregado<i class="material-icons">Cerrar</i></div>');
                $("#mensaje").css('color', '#FFF');
                $scope.acuerdoN = {}; // Limpiamos el scope
            }
        });
    }

    /* Método para eliminar acuerdos */ 
    $scope.deleteAcuerdo = function(id) {
        // Hacemos una petición DELETE a la API para borrar el id que nos pase el html por parametro
        $http.delete(url_server+"acuerdo/eliminar", { params : {identificador: id}}).success(function(response) {
            if(response.status === "OK") { // Si la API nos devuelve un OK...
                socket.emit('acuerdo_removido', lastUsuarioAcuerdo, acuerdo.ACUDES)
                $("#mensaje").empty();
                $("#mensaje").append('<div class="chip">Acuerdo eliminado <a href="acuerdos.html">Volver a lista de acuerdos</a></div>');
                $("#mensaje").css('color', '#FFF');
                $(".card-reveal").fadeOut()
                $scope.acuerdo = {}
            }
        });
    }

    /* Método para actualzar informacion del acuerdo */
    $scope.updateAcuerdo = function() {
        var acuerdo = $scope.acuerdo
        acuerdo.id = acuerdo._id; // Pasamos la _id a id para mayor comodidad del lado del servidor a manejar el dato.
        delete acuerdo._id
        $http.put(url_server+"acuerdo/actualizar", acuerdo).success(function(response) {
            if(response.status === "OK") {
                $("#mensaje").empty();
                $("#mensaje").append('<div class="chip">Información actualizada <i class="material-icons">Cerrar</i></div>');
                $("#mensaje").css('color', '#FFF');
                $(".card-reveal").fadeOut()
                if (acuerdo.ACUCPE == lastUsuarioAcuerdo) {
                    socket.emit('acuerdo_actualizado', acuerdo)
                }else{
                    socket.emit('acuerdo_removido', lastUsuarioAcuerdo, acuerdo.ACUDES)
                    socket.emit("nuevo_acuerdo", acuerdo);
                }
                getAcuerdoUnico(); // Actualizamos la lista de ToDo's
            }
        }).error(function(response) {alert(JSON.stringify(response))})
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