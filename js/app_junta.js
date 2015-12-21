/* Controllers */

var app = angular.module('secreto', [])
var url_server = 'http://192.168.1.103:8080/';

$(document).on("click", ".modal-trigger", function(){
    var id = $(this).attr("id");
    $(id).openModal();
    //para el calendario
    $('.datepicker').pickadate({
        selectMonths: true, // Creates a dropdown to control month
        selectYears: 15, // Creates a dropdown of 15 years to control year
        min:new Date(),
        firstDay: 1,
        format: 'dd/mm/yy',
        formatSubmit: 'dd/mm/yy'
    });
});

//var myApp = angular.module('ToDoList',[]);
//angular.module('ToDoList.controllers', []).controller('MainCtrl', ['$scope', '$http', function($scope, $http) {
app.controller('juntaController', ['$scope', '$http', function($scope, $http) {
        var empresa = localStorage.getItem("empresa")
        $scope.juntaN = {}
		// Funcionalidad del controlador
		$scope.nuevaJunta = function() {
            /*$scope.juntaN.JUTHOR = getHora();*/
            $scope.juntaN.JUTSTA = "C";
            $scope.juntaN.empresa = empresa;
            // Hacemos un POST a la API para dar de alta nuestro nuevo ToDo
            $http.post(url_server+"junta/crear", $scope.juntaN).success(function(response) {
                if(response.status === "OK") { // Si nos devuelve un OK la API...
                    //alert("s "+$scope.juntaN.JUTSTA);
                    $scope.juntaN = {}; // Limpiamos el scope
                    $("#mensaje").empty();
                    $("#mensaje").append('<div class="chip">Junta generada<i class="material-icons">Cerrar</i></div>');
                    $("#mensaje").css('color', '#FFF');
                }
            });
        }

        $scope.deleteJunta = function(id) {
            //alert("delete id" + id);
            //primero buscamos el puesto para verificar que no este ocupado
            $http.delete(url_server+"junta/eliminar", { params : {identificador: id}}).success(function(response) {
                //console.log("function");
                if(response.status === "OK") { // Si la API nos devuelve un OK...
                    //$('#'+id+"-Delete").modal('hide');
                    $("#mensaje").empty();
                    $("#mensaje").append('<div class="chip">Junta eliminada <a href="acuerdos.html">Volver a lista de acuerdos</a></div>');
                    $("#mensaje").css('color', '#FFF');
                    $(".card-reveal").fadeOut()
                    $scope.junta = {}
                }
            });
        }

        $scope.updateJunta = function() {
            var junta = $scope.junta;
            $('#'+junta._id+"-Update").closeModal();
            //$('#'+junta._id+"-Update").modal('hide');
            junta.id = junta._id; // Pasamos la _id a id para mayor comodidad del lado del servidor a manejar el dato.
            delete junta._id; // Lo borramos para evitar posibles intentos de modificación de un ID en la base de datos
            //alert("Id "+junta.id+" email "+junta.email);
            // Hacemos una petición PUT para hacer el update a un documento de la base de datos.
            $http.put(url_server+"junta/actualizar", junta).success(function(response) {
                if(response.status === "OK") {
                    $("#mensaje").empty();
                    $("#mensaje").append('<div class="chip">Información actualizada <i class="material-icons">Cerrar</i></div>');
                    $("#mensaje").css('color', '#FFF');
                    $(".card-reveal").fadeOut()
                    getJuntaUnica(); // Actualizamos la lista de ToDo's
                }
            });
        }

        // Creamos una función para obtener los datos de la base de datos y actualizarlos cada que sea necesario.
        var getJuntas = function() {
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

        /* Método para obtener información de una junta específica */
        function getJuntaUnica() {
            $http.get(url_server+"junta/find/"+edit).success(function(response) {
                if(response.type) { // Si nos devuelve un OK la API...
                    $scope.junta = response.data[0];
                    getDirectivos();
                }
            });
        }

        /* Obtenemos a todos los directivos */
        function getDirectivos() {
            $http.get(url_server+"user/usuario/2/"+empresa).success(function(response) {
                if(response.type) { // Si nos devuelve un OK la API...
                    $scope.directivos = response.data;
                }
            });
            $http.get(url_server+"user/usuario/1/"+empresa).success(function(response) {
                if(response.type) { // Si nos devuelve un OK la API...
                    $scope.director = response.data;
                }
            });
            /*$scope.invitados = []
            for(var i=0;i<arr.length;i++){
                alert(i)
                //$scope.invitados.push($scope.directivos[i])
            }
            for(i=0;i<$scope.director.length;i++){
                //$scope.invitados.push($scope.director[i])
            }*/
            /*for(i=0;i<$scope.junta.JUTINV.length;i++){
                if($scope.invitados.indexOf($scope.junta.JUTINV) >= 0)
                    $scope.invitados.splice($scope.invitados.indexOf($scope.junta.JUTINV),1)
            }*/
            alert("Total de invitados "+$scope.invitados)
        }

        function addZero(i) {
            if (i < 10) {
                i = "0" + i;
            }
            return i;
        }

        function getHora() {
            var d = new Date();
            var x = document.getElementById("demo");
            var h = addZero(d.getHours());
            var m = addZero(d.getMinutes());
            var s = addZero(d.getSeconds());
            hora = h + ":" + m + ":" + s;
            $scope.hour = hora;
            $scope.stat = "1";
            return hora;
            //document.getElementById("hora").value = hora;
            //document.getElementById("stat").value = 1;
        }
        var nuevo = getUrlParameter('new')
        if (nuevo == undefined)
            getJuntas(); // Obtenemos la lista de ToDo al cargar la página
        var edit = getUrlParameter('id');
        /* Llamamos a la función para obtener la lista de usuario al cargar la pantalla */
        if (edit == undefined) {
            getJuntas();
        }else{
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
	}]);
