var app = angular.module('secreto', [])
//var url_server = 'http://192.168.1.103:8080/';
var url_server = 'http://159.203.128.165:8080/';
//var url_server = 'http://127.0.0.1:8080/';

//Para cerrar los modales
$(document).on("click","#eliminar", function(){
	$("#delete").openModal()// Abrimos la ventana
});

app.controller('ordenController', ['$scope', '$http', function($scope, $http) {
		//alert("asasdsadasdsadasdas");
        var nuevaClave = 0;
        var empresa = localStorage.getItem("empresa")
        $scope.ordenN = {}
        $scope.nuevaOrden = function() {
            /*$scope.juntaN.JUTHOR = getHora();*/
            $scope.ordenN.ORDSTA = "C";
            $scope.ordenN.empresa = empresa;
            $scope.ordenN.CLVJUT = document.getElementById('id').value;
            $scope.ordenN.ORDNUM = nuevaClave;
            // Hacemos un POST a la API para dar de alta nuestro nuevo ToDo
            $http.post(url_server+"orden/crear", $scope.ordenN).success(function(response) {
                if(response.status === "OK") { // Si nos devuelve un OK la API...
                    //alert("s "+$scope.juntaN.JUTSTA);
                    $scope.ordenN = {}; // Limpiamos el scope
                    $("#mensaje").empty();
                    $("#mensaje").append('<div class="chip">Orden generada<i class="material-icons">Cerrar</i></div>');
                    $("#mensaje").css('color', '#FFF');
                    getJuntaUnica();
                }
            })
        }

        var getOrden = function() {
            $http.get(url_server+"orden/listar/"+empresa).success(function(response) {
                if(response.status == "OK") {
                    $scope.ordenes = response.data;
                    if($scope.ordenes.length == 0){
                        $("#error").empty();
                        $("#error").append('<div class="row"><div class="col s12 m12 l12"><div class="card blue-grey darken-1"><div class="card-content white-text"><span class="card-title">Ops</span><p>Aún no hay Ordenes registradas en el sistema.</p></div></div></div></div>');
                        $("#error").css('color', '#d50000');
                    }else{
                        $("#error").empty();
                    }
                }
            })
        }

        var getJuntas = function() {
        	//alert("juntas");
            $http.get(url_server+"junta/listar/"+empresa).success(function(response) {
                if(response.status == "OK") {
                    $scope.juntas = response.data;
                    if($scope.juntas.length == 0){
                        $("#error").empty();
                        $("#error").append('<div class="row"><div class="col s12 m12 l12"><div class="card blue-grey darken-1"><div class="card-content white-text"><span class="card-title">Ops</span><p>Aún no hay juntas registradas en el sistema.</p></div></div></div></div>');
                        $("#error").css('color', '#d50000');
                    }else{
                        $("#error").empty();
                    }
                }
            })
        }

        //$scope.deleteOrden = function(id) {
            $scope.deleteOrden = function(id,clvJunta) {
            $('#delete').closeModal()
            //primero buscamos el puesto para verificar que no este ocupado
            $http.delete(url_server+"orden/eliminar", { params : {identificador: id}}).success(function(response) {
                //console.log("function");
                if(response.status === "OK") { // Si la API nos devuelve un OK...
                    //$('#'+id+"-Delete").modal('hide');
                    $("#mensaje").empty();
                    //$("#mensaje").append('<div class="chip">Junta eliminada <a href="orden_del_dia.html">Volver a lista de ordenes</a></div>');
                    $("#mensaje").append('<div class="chip">Junta eliminada <a href="orden_del_dia.html?id='+clvJunta+'">Volver a lista de ordenes</a></div>');
                    $("#mensaje").css('color', '#FFF');
                    $(".card-reveal").fadeOut()
                    $scope.orden = {}
                }
            });
        }

        $scope.updateOrden = function() {
            var orden = $scope.orden;
            //$('#'+orden._id+"-Update").closeModal();
            //$('#'+junta._id+"-Update").modal('hide');
            orden.id = orden._id; // Pasamos la _id a id para mayor comodidad del lado del servidor a manejar el dato.
            delete orden._id; // Lo borramos para evitar posibles intentos de modificación de un ID en la base de datos
            //alert("Id "+junta.id+" email "+junta.email);
            // Hacemos una petición PUT para hacer el update a un documento de la base de datos.
            $http.put(url_server+"orden/actualizar", orden).success(function(response) {
                if(response.status === "OK") {
                    $("#mensaje").empty();
                    $("#mensaje").append('<div class="chip">Información actualizada <i class="material-icons">Cerrar</i></div>');
                    $("#mensaje").css('color', '#FFF');
                    $(".card-reveal").fadeOut()
                    getOrdenUnica(); // Actualizamos la lista de ToDo's
                }
            });
        }

        /* Método para obtener información de una junta específica */
        function getOrdenUnica() {
            $http.get(url_server+"orden/find/"+edit).success(function(response) {
                if(response.type) { // Si nos devuelve un OK la API...
                    $scope.orden = response.data[0];
                    //getDirectivos();
                    //getJuntas();
                }
            });
        }
        //getJuntas();
        //getOrden()
        var nuevo = getUrlParameter('new')
        if (nuevo == undefined){
            //alert("nuevo undefinedasdsad");
            getJuntas(); // Obtenemos la lista de ToDo al cargar la página
        	getOrden();
        }
        var edit = getUrlParameter('id');
        /* Llamamos a la función para obtener la lista de usuario al cargar la pantalla */
        if (edit == undefined) {
            //alert("edit undefined|12213");
            getOrden();
            getJuntas();
        }else{
            //alert("edit no undefinedasdsa");
        	getOrdenUnica();
            getJuntaUnica();
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
        
        //Método para obtener información de una junta específica
        function getJuntaUnica() {
            //alert("getJuntaUnica");
            $http.get(url_server+"junta/find/"+edit).success(function(response) {
                if(response.type) { // Si nos devuelve un OK la API...
                    $scope.junta = response.data[0];
                    document.getElementById('id').value = response.data[0]._id;
                    var idt = response.data[0]._id;
                    //alert("idt "+idt);
                    $http.get(url_server+"orden/allOrden", { params : {identificador: idt}}).success(function(response){

                        var indice = response.data;
                        //alert("entro indice "+indice.length);
                        //nuevaClave = 0;
                        if (indice == 0) {
                            nuevaClave = 1;
                        }else{
                            nuevaClave = getNewIndice(indice);
                        }
                        //alert("nuevaClave "+nuevaClave);
                        $scope.newClave = nuevaClave;
                    });
                }
            });
        }

        function getNewIndice(data){
            var contador = 1;
            var nuevaClave = -1;
            var booleano = true;
            var bandera;
            while(booleano){
                bandera = 0;
                for (var i = 0; i < data.length ; i++) {
                    if(data[i].ORDNUM == contador){
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
}]);