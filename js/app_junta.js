/* Controllers */
var app = angular.module('secreto', [])
var url_server = 'http://159.203.128.165:8080/';
//var url_server = 'http://127.0.0.1:8080/';
var socket = io.connect(url_server);

$(document).on("click", ".modal-trigger", function(){
    var id = $(this).attr("id");
    $(id).openModal();
    //para el calendario
    $('.datepicker').pickadate({
        selectMonths: true, // Creates a dropdown to control month
        selectYears: 15, // Creates a dropdown of 15 years to control year
        min:new Date(),
        firstDay: 1,
        format: 'dd/mm/yyyy',
        formatSubmit: 'dd/mm/yyyy'
    });
});

//Para abrir los modales
$(document).on("click","#eliminar", function(){
    $("#delete").openModal()// Abrimos la ventana
});

$(document).on("click","#invitar", function(){
    $("#inv").openModal()// Abrimos la ventana
});

$(document).on("click","#send", function(){
    $("#sendInv").openModal()// Abrimos la ventana
});

//var myApp = angular.module('ToDoList',[]);
//angular.module('ToDoList.controllers', []).controller('MainCtrl', ['$scope', '$http', function($scope, $http) {
app.controller('juntaController', ['$scope', '$http', function($scope, $http) {
        var empresa = localStorage.getItem("empresa")
        //alert("empresa "+empresa);
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
                    $("#mensaje").empty();
                    $("#mensaje").append('<div class="chip waves-effect waves-light col s12">Agregado Junta '+$scope.juntaN.JUTCVE+'. <i class="material-icons">Cerrar</i></div>');
                    $("#mensaje").css('color', '#FFF');
                    $scope.juntaN = {}; // Limpiamos el scope
                    //window.location.href = "juntas_de_trabajo.html";
                }
            });
        }

        getPuesto();

        $scope.deleteJunta = function(id) {
            //alert("delete id" + id);
            $('#delete').closeModal();
            $http.get(url_server+"orden/buscarJunta", { params : {miJunta: id}}).success(function(response){
                console.log("data "+response);
                if(response.status === "OK"){//Encontro el registro que se esta buscando
                    $("#mensaje").empty();
                    $("#mensaje").append('<div class="chip"><a href="juntas_de_trabajo.html">La junta no puede ser eliminada porque esta ocupada por una orden.</a></div>');
                    $("#mensaje").css('color', '#FFF');
                    $("#mensaje").fadeIn()
                }else{//no encontro el registro que se esta buscando
                    
                    $http.get(url_server+"acuerdo/buscarJunta", { params : {miJunta: id}}).success(function(response){

                        if(response.status === "OK"){//Encontro el registro que se esta buscando
                            $("#mensaje").empty();
                            $("#mensaje").append('<div class="chip"><a href="juntas_de_trabajo.html">La junta no puede ser eliminada porque esta ocupada por un acuerdo.</a></div>');
                            $("#mensaje").css('color', '#FFF');
                            $("#mensaje").fadeIn()
                        }else{
                            $http.delete(url_server+"junta/eliminar", { params : {identificador: id}}).success(function(response) {
                                //console.log("function");
                                if(response.status === "OK") { // Si la API nos devuelve un OK...
                                    //$('#'+id+"-Delete").modal('hide');
                                    $("#mensaje").empty();
                                    $("#mensaje").append('<div class="chip">Junta eliminada <a href="juntas_de_trabajo.html">Volver a lista de juntas</a></div>');
                                    $("#mensaje").css('color', '#FFF');
                                    $(".card-reveal").fadeOut()
                                    $scope.junta = {}
                                }
                            });
                        }
                    });

                    /*$http.delete(url_server+"junta/eliminar", { params : {identificador: id}}).success(function(response) {
                        //console.log("function");
                        if(response.status === "OK") { // Si la API nos devuelve un OK...
                            //$('#'+id+"-Delete").modal('hide');
                            $("#mensaje").empty();
                            $("#mensaje").append('<div class="chip">Junta eliminada <a href="juntas_de_trabajo.html">Volver a lista de juntas</a></div>');
                            $("#mensaje").css('color', '#FFF');
                            $(".card-reveal").fadeOut()
                            $scope.junta = {}
                        }
                    });*/

                }
            })
            /*//primero buscamos el puesto para verificar que no este ocupado
            $http.delete(url_server+"junta/eliminar", { params : {identificador: id}}).success(function(response) {
                //console.log("function");
                if(response.status === "OK") { // Si la API nos devuelve un OK...
                    //$('#'+id+"-Delete").modal('hide');
                    $("#mensaje").empty();
                    $("#mensaje").append('<div class="chip">Junta eliminada <a href="juntas_de_trabajo.html">Volver a lista de juntas</a></div>');
                    $("#mensaje").css('color', '#FFF');
                    $(".card-reveal").fadeOut()
                    $scope.junta = {}
                }
            });*/
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

        $scope.checkedEmpleados = [];
        $scope.checkedIdEmp = [];
        $scope.checkedPuesto = [];

        //funcion que captura a los empleados que selecciona para las juntas
        $scope.addEmpleado = function(id,puesto,empleado) {
            //alert("idEmp "+id+" empleado "+empleado);
            var index = $scope.checkedEmpleados.indexOf(empleado);
            var indexID = $scope.checkedIdEmp.indexOf(id);
            var indexPuesto = $scope.checkedPuesto.indexOf(puesto);
            
            if ( index != -1 ) {//ya esta agregado
                $scope.checkedEmpleados.splice(index,1);
            }else{
                $scope.checkedEmpleados.push(empleado);
            }
            
            if ( indexID != -1 ) {//ya esta agregado
                $scope.checkedIdEmp.splice(indexID,1);
                $scope.checkedPuesto.splice(indexPuesto,1);
            }else{
                $scope.checkedIdEmp.push(id);
                $scope.checkedPuesto.push(puesto);
            }

            /*if ( indexPuesto != -1 ) {//ya esta agregado
                $scope.checkedPuesto.splice(indexPuesto,1);
            }else{
                $scope.checkedPuesto.push(puesto);
            }*/

            if ($scope.checkedEmpleados.length > 0) {
                document.getElementById('enviarInvitaciones').disabled = false;
            }else{
                document.getElementById('enviarInvitaciones').disabled = true;
            }
        };
        //$scope.totalInv = 0;
        // Función para enviar invitacion a usuarios
        //$scope.invitar = function(invitados, junta_info) {
        $scope.invitar = function(junta_info) {
            var invitados = $scope.checkedEmpleados;
            var invitadosID = $scope.checkedIdEmp;
            var puestos = $scope.checkedPuesto;
            //$scope.totalInv = invitados.length;
            //alert("adasdasd "+invitados);
            //alert("invitados "+invitados[0]+" junta_info "+junta_info._id);
            var empleados_invitados = '['
            for (var i = 0; i < invitados.length; i++){
                //empleados_invitados += '{ "id":"'+invitados[i]._id+'",';
                //empleados_invitados += '"nombre":"'+invitados[i].nombreC+'"';
                empleados_invitados += '{ "id":"'+invitadosID[i]+'",';
                empleados_invitados += '"nombre":"'+invitados[i]+'",';
                empleados_invitados += '"miPuesto":"'+puestos[i]+'"';
                empleados_invitados += '}';
                if (i < invitados.length - 1)
                    empleados_invitados += ','
                //socket.emit("nueva_junta", junta_info._id, invitados[i]._id, junta_info.JUTMOT);
                
                //socket.emit("nueva_junta", junta_info._id, invitadosID[i], junta_info.JUTMOT);
            }
            empleados_invitados += ']';
            //var invitaciones1 = JSON.stringify(empleados_invitados)
            
            var invitaciones = JSON.parse(empleados_invitados)
           // alert(invitaciones)
            var junta = $scope.junta;
            junta.JUTINV = invitaciones;
            junta.id = junta._id; // Pasamos la _id a id para mayor comodidad del lado del servidor a manejar el dato.
            delete junta._id; // Lo borramos para evitar posibles intentos de modificación de un ID en la base de datos
            //alert("Id "+junta.id+" email "+junta.email);
            // Hacemos una petición PUT para hacer el update a un documento de la base de datos.
            $http.put(url_server+"junta/actualizar", junta).success(function(response) {
                if(response.status === "OK") {
                    $("#mensaje").empty();
                    $("#mensaje").append('<div class="chip">Empleados agregados a la junta <i class="material-icons">Cerrar</i></div>');
                    $("#mensaje").css('color', '#FFF');
                    $(".card-reveal").fadeOut()
                    getJuntaUnica(); // Actualizamos la lista de ToDo's
                }
            });
            $scope.checkedEmpleados = [];
            $scope.checkedIdEmp = [];            
            $('#inv').closeModal();
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
                    today = get_today()
                    var dias_diferencias = restaFechas(today, response.data[0].JUTFEC)
                    if (dias_diferencias == 0) {
                        $scope.dias_para_junta = "Hoy se llevará acabo esta junta en "+response.data[0].JUTLUG+" a las "+response.data[0].JUTHOR+" hrs."
                    }else if (dias_diferencias == 1) {
                        $scope.dias_para_junta = "Mañana se llevará acabo esta junta en "+response.data[0].JUTLUG+" a las "+response.data[0].JUTHOR+" hrs."
                    }else if (dias_diferencias > 0) {
                        $scope.dias_para_junta = "Esta junta se llevará acabo en "+dias_diferencias+" días en "+response.data[0].JUTLUG+" a las "+response.data[0].JUTHOR+" hrs."
                    }else if (dias_diferencias < 0) {
                        $scope.dias_para_junta = "Esta junta se llevó acabo hace "+Math.abs(dias_diferencias)+" días en "+response.data[0].JUTLUG+" a las "+response.data[0].JUTHOR+" hrs."
                    };
                    //$scope.junta.JUTINV = JSON.parse($scope.junta.JUTINV)
                    if ($scope.junta.JUTINV.length == 0) {
                        $("#boton_invitados").show()
                        //$("#invitados").show()
                    }else{
                        $("#boton_invitados").empty()
                    }
                    getDirectivos();
                }
            });
        }

        /* Obtenemos a todos los directivos */
        function getDirectivos() {
            //var invitados_lista = $scope.junta.JUTINV;
            $http.get(url_server+"user/usuario/2/"+empresa).success(function(response) {
                if(response.type) { // Si nos devuelve un OK la API...
                    $scope.directivos = response.data;
                }
            })
            $http.get(url_server+"user/usuario/1/"+empresa).success(function(response) {
                if(response.type) { // Si nos devuelve un OK la API...
                    $scope.director = response.data;
                }
            });
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
            //alert("nuevo undefined");
            getJuntas(); // Obtenemos la lista de ToDo al cargar la página
        var edit = getUrlParameter('id');
        /* Llamamos a la función para obtener la lista de usuario al cargar la pantalla */
        if (edit == undefined) {
            //alert("edit undefined");
            getJuntas();
        }else{
            //alert("edit no undefined");
            getJuntaUnica();
            getOrdenByJunta();
        }

        function getUrlParameter(sParam) {
            //alert("sParam "+sParam)
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

        /* Método para obtener los puestos de la BD */
        function getPuesto(){
            $http.get(url_server+"puesto/listar/"+empresa).success(function(response) {
                if(response.status == "OK") {
                    $scope.puest = response.data;
                }
            })
        }

        function getOrdenByJunta() {
            //alert("getOrdenByJunta");
            $http.get(url_server+"orden/byJunta", { params : {identificador: edit}}).success(function(response) {
                if(response.status == "OK") {
                    $scope.ordenByJunta = response.data;
                    //alert("tam Orden "+$scope.ordenByJunta.length);
                    /*if($scope.ordenes.length == 0){
                        $("#error").empty();
                        $("#error").append('<div class="row"><div class="col s12 m12 l12"><div class="card blue-grey darken-1"><div class="card-content white-text"><span class="card-title">Ops</span><p>Aún no hay Ordenes registradas en el sistema.</p></div></div></div></div>');
                        $("#error").css('color', '#d50000');
                    }else{
                        $("#error").empty();
                    }*/
                }
            })
        }

        $scope.sendInvitaciones = function(junta) {
            var invitados = junta.JUTINV;
            //alert("invitados "+invitados[0].id);
            for (var i = 0; i < invitados.length; i++){
                socket.emit("nueva_junta", junta._id, invitados[i].id, junta.JUTMOT);
            }
            $("#mensaje").empty();
            $("#mensaje").append('<div class="chip">Invitaciones enviadas <i class="material-icons">Cerrar</i></div>');
            $("#mensaje").css('color', '#FFF');
            $(".card-reveal").fadeOut()           
            $('#sendInv').closeModal();
        }

        /*function getOrdenUnica() {

            $http.get(url_server+"orden/find/"+edit).success(function(response) {
                if(response.type) { // Si nos devuelve un OK la API...
                    //var data = response.data;
                    //$scope.tamOrden = data.length;
                    //getDirectivos();
                    //getJuntas();
                }
            });
        }*/
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
}]);
