var url_server = 'http://159.203.128.165:8080/';
//var url_server = 'http://127.0.0.1:8080/';
var socket = io.connect(url_server);
/* Controlador para secretario */
var app = angular.module('secreto', [])
$('.datepicker').pickadate({
        selectMonths: true, // Creates a dropdown to control month
        selectYears: 15, // Creates a dropdown of 15 years to control year
        min:new Date(),
        firstDay: 1,
        format: 'dd/mm/yyyy',
        formatSubmit: 'dd/mm/yyyy'
    });
//Para abrir los modales
$(document).on("click","#eliminar", function(){
    $("#delete").openModal()// Abrimos la ventana
});

app.controller('secretarioController', function($scope, $http){
    $scope.usuario = {}
	$scope.directivos = {}
	$scope.acuerdoN = {}
	$scope.acuerdos = {}
    $scope.acuerdo = {}
    var lastUsuarioAcuerdo // variable para saber que usuario tiene a cargo un acuerdo

	var usuario = localStorage.getItem("usuario")
    var empresa = localStorage.getItem("empresa")
	$scope.usuario = JSON.parse(usuario);
    /* Obtenemos los parametros de la url */
    //getAcuerdos();
    var edit = getUrlParameter('id');
    /* Llamamos a la función para obtener la lista de usuario al cargar la pantalla */
    if (edit == undefined) {
        getDirectivos();
        getAcuerdos();
    }else{
        getDirectivos();
        getAcuerdoUnico();
    }
    getJuntas();
    get_cumpleanos()
    // funcion para saber la fecha de cumpleaños del empleado
    function get_cumpleanos(){
        var today = get_today()
        var dias_diferencias = restaFechas(today, $scope.usuario.fecha_nac)
        if (dias_diferencias == 0) {
            $("#mensaje_cumple").html($scope.usuario.nombreC+" Felicidades hoy en tu cumpleaños!")
            $("#mensaje_cumple").addClass('card')
        };
    }
    function getJuntas() {
        $http.get(url_server+"junta/listar/"+empresa).success(function(response) {
            if(response.status == "OK") {
                $scope.juntas = response.data;
                /*if($scope.juntas.length == 0){
                    $("#error").empty();
                    $("#error").append('<div class="row"><div class="col s12 m12 l12"><div class="card blue-grey darken-1"><div class="card-content white-text"><span class="card-title">Ops</span><p>Aún no hay juntas registradas en el sistema.</p></div></div></div></div>');
                    $("#error").css('color', '#d50000');
                }else{
                    $("#error").empty();
                }*/
            }
        })
    }

	/* Obtenemos a todos los directivos */
	function getDirectivos() {
		$http.get(url_server+"user/usuario/2/"+empresa).success(function(response) {
	        if(response.type) { // Si nos devuelve un OK la API...
	        	$scope.directivos = response.data;
	        }
	    });
	}
	//var nuevaClave = 0;
    /* Obtenemos la lista de acuerdos */
    function getAcuerdos() {
        //alert("getAcuerdos "+empresa)
    	$http.get(url_server+"acuerdo/listar/"+empresa).success(function(response) {
	        if(response.status == 'OK') { // Si nos devuelve un OK la API...
                //alert("ok "+response.data[0].ACUNAC);
	        	$scope.acuerdos = response.data;
	        	if($scope.acuerdos.length == 0){
                    //alert("length == 0");
                    $scope.newClave = 1;
                    //nuevaClave = 1;
					$("#mensaje").empty();
					$("#mensaje").append('<div class="row"><div class="col s12 m12 l12"><div class="card blue-grey darken-1"><div class="card-content white-text"><span class="card-title">Ops</span><p>Aún no hay acuerdos registrados en el sistema.</p></div></div></div></div>');
					$("#mensaje").css('color', '#d50000');
				}else{
	                $("#mensaje").empty();
                    var indice = response.data;
                    $scope.newClave = getNewIndice(indice);
                    //alert("length > 0 "+$scope.newClave);
                    //nuevaClave = $scope.newClave;
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
    var nC = 0;
    /* Método para agregar un acuerdo */
    $scope.nuevoAcuerdo = function(){
        //ACUNAC
        //alert("nuevoAcuerdo");
        $http.get(url_server+"acuerdo/listar/"+empresa).success(function(response) {
            //if(response.status == 'OK') { // Si nos devuelve un OK la API...
                //$scope.acuerdos = response.data;
                var indice = response.data;
                //alert("response "+response.data);
                if(indice.length == 0){
                    nC = 1;
                }else{
                    for (var i = 0 ; i < indice.length ; i++) {
                        //ACUCON                           
                        if (indice[i].ACUCON == $scope.acuerdoN.ACUCON) {
                            $("#error").empty();
                            $("#error").append('<div class="chip waves-effect waves-light col s12">Ya existe este consecutivo. Agregue Otro<i class="material-icons">Cerrar</i></div>');
                            $("#error").css('color', '#FFF');
                            return;
                        }
                    }
                    nC = getNewIndice(indice);
                }
            //}
            $scope.acuerdoN.empresa = empresa
            $scope.acuerdoN.ACUNAC = parseInt(nC);
            $scope.acuerdoN.ACUSTA = "C";
            //alert("ACUNAC "+$scope.acuerdoN.ACUNAC+" ACUCON "+$scope.acuerdoN.ACUCON);
            $http.post(url_server+"acuerdo/crear", $scope.acuerdoN).success(function(response) {
                if(response.status === "OK") { // Si nos devuelve un OK la API...
                    socket.emit("nuevo_acuerdo", response.data);
                    $("#error").empty();
                    $("#error").append('<div class="chip waves-effect waves-light col s12">Acuerdo agregado<i class="material-icons">Cerrar</i></div>');
                    $("#error").css('color', '#FFF');
                    $scope.acuerdoN = {}; // Limpiamos el scope
                    getAcuerdos();
                }
            });
        });
    }

    /* Método para eliminar acuerdos */ 
    $scope.deleteAcuerdo = function(id) {
        //alert("entro")
        $("#delete").closeModal();
        // Hacemos una petición DELETE a la API para borrar el id que nos pase el html por parametro
        $http.delete(url_server+"acuerdo/eliminar", { params : {identificador: id}}).success(function(response) {
            if(response.status === "OK") { // Si la API nos devuelve un OK...
                /*$("#mensaje").empty();
                $("#mensaje").append('<div class="chip">Acuerdo eliminado <a href="acuerdos.html">Volver a lista de acuerdos</a></div>');
                $("#mensaje").css('color', '#FFF');
                $(".card-reveal").fadeOut()*/
                //alert("if");
                $("#mensaje").empty();
                $("#mensaje").append('<div class="chip">Acuerdo eliminado <a href="acuerdos.html">Volver a lista de acuerdos</a></div>');
                $("#mensaje").css('color', '#FFF');
                $(".card-reveal").fadeOut();
                socket.emit('acuerdo_removido', lastUsuarioAcuerdo, acuerdo.ACUDES)
                $scope.acuerdo = {}
            }
        });
    }

    /* Método para actualzar informacion del acuerdo */
    $scope.updateAcuerdo = function() {
        //alert("updateAcuerdo")
        var acuerdo = $scope.acuerdo
        acuerdo.id = acuerdo._id; // Pasamos la _id a id para mayor comodidad del lado del servidor a manejar el dato.
        delete acuerdo._id

        $http.get(url_server+"acuerdo/listar/"+empresa).success(function(response) {
            //if(response.status == 'OK') { // Si nos devuelve un OK la API...
                //$scope.acuerdos = response.data;
                var indice = response.data;
                //alert("response "+response.data);
                if(indice.length == 0){
                    nC = 1;
                }else{
                    for (var i = 0 ; i < indice.length ; i++) {
                        //ACUCON                           
                        if (indice[i].ACUCON == $scope.acuerdo.ACUCON) {
                            //$("#mensaje").empty();
                            //$("#mensaje").append('<div class="chip waves-effect waves-light col s12">Ya existe este consecutivo. <a href="acuerdos.html">Agregue Otro</a></div>');
                            //$("#mensaje").css('color', '#FFF');
                            //return;
                            break;
                        }
                    }
                    nC = getNewIndice(indice);
                }
            //}
            //$scope.acuerdoN.empresa = empresa
            $scope.acuerdo.ACUNAC = parseInt(nC);
            //$scope.acuerdoN.ACUSTA = "C";

            $http.put(url_server+"acuerdo/actualizar", acuerdo).success(function(response) {
                if(response.status === "OK") {
                    $("#mensaje").empty();
                    $("#mensaje").append('<div class="chip">Información actualizada <i class="material-icons">Cerrar</i></div>');
                    $("#mensaje").css('color', '#FFF');
                    $(".card-reveal").fadeOut()
                    if (acuerdo.ACUCPE == lastUsuarioAcuerdo) {
                        //alert("if "+acuerdo);
                        //band = 1;
                        socket.emit('acuerdo_actualizado', acuerdo)
                    }else{
                        //alert("else");
                        socket.emit('acuerdo_removido', lastUsuarioAcuerdo, acuerdo.ACUDES)
                        socket.emit("nuevo_acuerdo", acuerdo);
                    }

                    getAcuerdoUnico(); // Actualizamos la lista de ToDo's
                }
            }).error(function(response) {alert(JSON.stringify(response))})
        });


        /*$http.put(url_server+"acuerdo/actualizar", acuerdo).success(function(response) {
            if(response.status === "OK") {
                $("#error").empty();
                $("#error").append('<div class="chip">Información actualizada <i class="material-icons">Cerrar</i></div>');
                $("#error").css('color', '#FFF');
                $(".card-reveal").fadeOut()
                if (acuerdo.ACUCPE == lastUsuarioAcuerdo) {
                    alert("if "+acuerdo);
                    //band = 1;
                    socket.emit('acuerdo_actualizado', acuerdo)
                }else{
                    alert("else");
                    socket.emit('acuerdo_removido', lastUsuarioAcuerdo, acuerdo.ACUDES)
                    socket.emit("nuevo_acuerdo", acuerdo);
                }

                getAcuerdoUnico(); // Actualizamos la lista de ToDo's
            }
        }).error(function(response) {alert(JSON.stringify(response))})*/

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

    function getNewIndice(data){
        //alert("data "+data[0].ACUNAC);
        var contador = 1;
        var nuevaClave = -1;
        var booleano = true;
        var bandera;
        while(booleano){
            bandera = 0;
            for (var i = 0; i < data.length ; i++) {
                if(data[i].ACUNAC == contador){
                    bandera = 1;
                }
            }
            if (bandera == 1) {
                contador++;
                booleano = true;
            }else{
                booleano = false;
            }
        }
        return contador;
    }
    // Funcion que obtiene la diferencia de dos fechas en dias
    function restaFechas(f1,f2){
        var aFecha1 = f1.split('/'); 
        var aFecha2 = f2.split('/'); 
        var fFecha1 = Date.UTC(aFecha1[2],aFecha1[1]-1,aFecha1[0]); 
        var fFecha2 = Date.UTC(aFecha2[2],aFecha2[1]-1,aFecha2[0]); 
        var dif = fFecha2 - fFecha1;
        var dias = Math.floor(dif / (1000 * 60 * 60 * 24)); 
        return dias;
    }

    function get_today(){
        // Obtenemos la fecha de hoy con el formato dd/mm/yyyy
        var today = new Date()
        var dd = today.getDate();
        var mm = today.getMonth()+1; //January is 0!
        var yyyy = today.getFullYear();
        if(dd<10){
            dd='0'+dd
        } 
        if(mm<10){
            mm='0'+mm
        } 
        var today = dd+'/'+mm+'/'+yyyy;
        return today;
    }
});