
// Si tengo seleccionado un marcador, y de repente cambio la ruta... ocurre un error (me quita el seleccionado y no muestra modal)


// information about server communication. This sample webservice is provided by Wikitude and returns random dummy places near given location
var ServerInformation = {
	pdiData_SERVER: "https://example.wikitude.com/GetSamplePois/",
	pdiData_SERVER_ARG_LAT: "lat",
	pdiData_SERVER_ARG_LON: "lon",
	pdiData_SERVER_ARG_NR_POIS: "nrPois"
};

var ServerData = null;

var url_api = "http://192.168.2.101:8000";



// implementation of AR-Experience (aka "Mundo")
var Mundo = {

	rango_vision: 5050,
	usuario: Usuario,
	ruta: null,
	paradas_vector : [],
	marcadores_lista: [],
	marcador_actual: null,


	// you may request new data from server periodically, however: in this sample data is only requested once
	isRequestingData: false,

	// true once data was fetched
	initiallyLoadedData: false,

	// different POI-Marker assets
	markerDrawable_idle: null,
	markerDrawable_selected: null,
	markerDrawable_directionIndicator: null,


	locationUpdateCounter: 0,
	updatePlacemarkDistancesEveryXLocationUpdates: 10,

	
	ruta: null,
	ruta_prev: null,
	horario: null,
	horario_prev: null,

	cambio_ruta: false,
	cambio_horario: false,



	// called to inject new POI data
	crearMarcadores: function crearMarcadoresFn(pdiData) {

		// empty list of visible markers
		Mundo.marcadores_lista = [];

		// start loading marker assets
		Mundo.markerDrawable_idle = new AR.ImageResource("assets/marker_idle.png");
		Mundo.markerDrawable_selected = new AR.ImageResource("assets/marker_selected.png");
		Mundo.markerDrawable_directionIndicator = new AR.ImageResource("assets/indi.png");

		for (var currentPlaceNr = 0; currentPlaceNr < pdiData.length; currentPlaceNr++) {

			var singlePdi = {
				"id": pdiData[currentPlaceNr].id,
				"latitude": parseFloat(pdiData[currentPlaceNr].latitude),
				"longitude": parseFloat(pdiData[currentPlaceNr].longitude),
				"altitude": parseFloat(pdiData[currentPlaceNr].altitude),
				"title": pdiData[currentPlaceNr].nombre,
				"description": pdiData[currentPlaceNr].referencia,

				"referencia": pdiData[currentPlaceNr].referencia,
				"proximo": pdiData[currentPlaceNr].proximo,
				"tiempo_proximo": pdiData[currentPlaceNr].tiempo_proximo
			};

			Mundo.marcadores_lista.push(new Marcador(singlePdi));
		}

		// updates distance information of all placemarks
		Mundo.updateDistanceToUserValues();

	},

	// sets/updates distances of all makers so they are available way faster than calling (time-consuming) distanceToUser() method all the time
	updateDistanceToUserValues: function updateDistanceToUserValuesFn() {

		for (var i = 0; i < Mundo.marcadores_lista.length; i++) {
			Mundo.marcadores_lista[i].distanceToUser = Mundo.marcadores_lista[i].markerObject.locations[0].distanceToUser();
		}		
	},


	// location updates, fired every time you call architectView.setLocation() in native environment
	cambioLocacion: function cambioLocacionFn(lat, lon, alt, acc) {

		Mundo.usuario.LATITUDE = lat;
		Mundo.usuario.LONGITUDE = lon;
		Mundo.usuario.ALTITUDE = alt;


		// update culling distance, so only places within given range are rendered
    	AR.context.scene.cullingDistance = Math.max(Mundo.rango_vision, 1);


		if (Mundo.locationUpdateCounter === 0) {
			// update placemark distance information frequently, you max also update distances only every 10m with some more effort
			Mundo.updateDistanceToUserValues();
		}

		// helper used to update placemark information every now and then (e.g. every 10 location upadtes fired)
		Mundo.locationUpdateCounter = (++Mundo.locationUpdateCounter % Mundo.updatePlacemarkDistancesEveryXLocationUpdates);
	},


	calcularDistanciaFuncionPrueba: function calcularDistanciaFuncionPruebaFn(marcador){
		// It's ok for AR.Location subclass objects to return a distance of `undefined`. In case such a distance was calculated when all distances were queried in `updateDistanceToUserValues`, we recalculate this specific distance before we update the UI.
		if( undefined == marcador.distanceToUser ) {
			marcador.distanceToUser = marcador.markerObject.locations[0].distanceToUser();
		}

		// distance and altitude are measured in meters by the SDK. You may convert them to miles / feet if required.
		var distanceToUserValue = (marcador.distanceToUser > 999) ? ((marcador.distanceToUser / 1000).toFixed(2) + " km") : (Math.round(marcador.distanceToUser) + " m");

		return distanceToUserValue;
	},



	// fired when user pressed maker in cam
	mostrarDetallesMarcador: function mostrarDetallesMarcadorFn(marcador) {

		if(Mundo.marcador_actual)
			Marcador.prototype.desactivarMarcadores(Mundo.marcador_actual);

		Mundo.marcador_actual = marcador;


		$('#pdi-nombre').text(marcador.parada.nombre);
		$('#pdi-referencia').text(marcador.parada.referencia);
		
		if(marcador.parada.proxima.length > 0)
			$('#pdi-proximo').text('Próximo: '+marcador.parada.proxima);


		// $('#pdi-tiempo-proximo').text('Tiempo: '+marcador.parada.tiempo_proximo);


		// It's ok for AR.Location subclass objects to return a distance of `undefined`. In case such a distance was calculated when all distances were queried in `updateDistanceToUserValues`, we recalculate this specific distance before we update the UI.
		if( undefined == marcador.distanceToUser ) {
			marcador.distanceToUser = marcador.markerObject.locations[0].distanceToUser();
		}

		// distance and altitude are measured in meters by the SDK. You may convert them to miles / feet if required.
		var distanceToUserValue = (marcador.distanceToUser > 999) ? ((marcador.distanceToUser / 1000).toFixed(2) + " km") : (Math.round(marcador.distanceToUser) + " m");

		$("#poi-detail-distance").html(distanceToUserValue);


		// Mundo.marcador_actual.desactivarMarcadores(Mundo.marcador_actual);
	},

	// screen was clicked but no geo-object was hit
	onScreenClick: function onScreenClickFn() {
		Mundo.limpiarPantalla();
	},

	// returns distance in meters of placemark with maxdistance * 1.1
	getMaxDistance: function getMaxDistanceFn() {

		// sort places by distance so the first entry is the one with the maximum distance
		Mundo.marcadores_lista.sort(Mundo.sortByDistanceSortingDescending);

		// use distanceToUser to get max-distance
		var maxDistanceMeters = Mundo.marcadores_lista[0].distanceToUser;

		// return maximum distance times some factor >1.0 so ther is some room left and small movements of user don't cause places far away to disappear.
		return maxDistanceMeters * 1.1;
	},



	// helper to sort places by distance
	sortByDistanceSorting: function(a, b) {
		return a.distanceToUser - b.distanceToUser;
	},

	// helper to sort places by distance, descending
	sortByDistanceSortingDescending: function(a, b) {
		return b.distanceToUser - a.distanceToUser;
	},




	crearMarcadoresActualizado: function crearMarcadoresActualizadoFn() {

		// empty list of visible markers
		Mundo.marcadores_lista = [];

		// start loading marker assets
		Mundo.markerDrawable_idle = new AR.ImageResource("assets/marker_idle.png");
		Mundo.markerDrawable_selected = new AR.ImageResource("assets/marker_selected.png");
		Mundo.markerDrawable_directionIndicator = new AR.ImageResource("assets/indi.png");

		if(Mundo.paradas_vector.length>0){

			for (var i = 0; i < Mundo.paradas_vector.length; i++) {

				var nombre_parada = '';

	                if(Mundo.paradas_vector[i].proxima.nombre)
	                    nombre_parada = Mundo.paradas_vector[i].proxima.nombre;

	            var parada = {
	                "latitud": parseFloat(Mundo.paradas_vector[i].latitud),
	                "longitud": parseFloat(Mundo.paradas_vector[i].longitud),
	                "altitud": parseFloat(Mundo.paradas_vector[i].altitud),
	                "nombre": Mundo.paradas_vector[i].nombre,
	                "referencia": Mundo.paradas_vector[i].referencia,
	                "proxima": nombre_parada,
	                "tiempo_proximo": '3 minutos'
	            };

				Mundo.marcadores_lista.push(new Marcador(parada));
			}

			Mundo.updateDistanceToUserValues();

		}
		else
		{
			// alert("no hay paradas para este horario");
			show_noty('Esta ruta no posee paradas para este horario', 'alert');
		}
	},








	borrarMarcadores: function(){
		Mundo.marcadores_lista = AR.context.destroyAll();
	},



	limpiarPantalla: function(){
		$('#pdi-nombre').text('');
		$('#pdi-referencia').text('');
		$('#pdi-proximo').text('');
		$('#pdi-tiempo-proximo').text('');

		if(Mundo.marcador_actual){
			Marcador.prototype.desactivarMarcadores(Mundo.marcador_actual);

			Mundo.marcador_actual = null;
		}
	},



	desactivarMarcadores: function(){
		show_noty('a desactivar marcadores', 'alert');

		for (var i = 0; i < Mundo.marcadores_lista.length; i++) {
			Marcador.prototype.desactivarMarcadores(Mundo.marcadores_lista[i]);
		}	

		show_noty('desactivados todos', 'alert');
	},



	solicitarParadas: function(urlParametro){
		var urlFn = url_api+urlParametro;

		$.get(urlFn, function(data){

				if(data.status == 200){

					Mundo.paradas_vector = data.paradas;

					Mundo.horario_prev = Mundo.horario;
					Mundo.ruta_prev = Mundo.ruta;

					Mundo.orderVectorParadas();
					Mundo.crearMarcadoresActualizado();
				}else{
					show_noty(data.msj,'alert');
				}

		})
		.fail(function() {
			show_noty('Servidor no disponible', 'alert');
		});
	},


	orderVectorParadas: function(){
		
		for(var i=0;i<Mundo.paradas_vector.length;i++){

            if(Mundo.paradas_vector[i+1]){

                if(Mundo.paradas_vector[i].id_ruta == Mundo.paradas_vector[i+1].id_ruta){
                    
                    var proxima = {nombre: Mundo.paradas_vector[i+1].nombre};

                    Mundo.paradas_vector[i].proxima = proxima;
                }
            }
            else{
            	var proxima = {nombre: null};
                
                Mundo.paradas_vector[i].proxima = proxima;
            }
        }     
	}

};




function abrirCerrarModal(display){
    $("#modal, .modal__content").css("display",display);


}


function clickCerrarModal(){
    if(Mundo.horario && Mundo.ruta == Mundo.ruta_prev){
        abrirCerrarModal('none');

        $('.ui-field-contain').css('display','block');
    }else{
    	// alert("OK SELECCIONA UNA RUTA");
        show_noty('Selecciona un horario', 'alert');
    }
}



function seleccionarHorario(){

	var horarioFn = null;

    if($('input[name="horario"]').is(':checked'))
        horarioFn = document.querySelector('input[name="horario"]:checked').value;
           

    if(horarioFn){

        Mundo.horario = JSON.parse(horarioFn);

        var horario_text = ""+Mundo.horario.hora+" "+ Mundo.horario.periodo;

        $('#horario-seleccionado').text(horario_text);
        $('#horario-seleccionado-div').css('display','block');

        abrirCerrarModal('none');

        $('.ui-field-contain').css('display','block');

        if(Mundo.horario != Mundo.horario_prev){
        	try {
	            Mundo.borrarMarcadores();
	        } catch (err) {
	            console.log(err)
	    	}

			solicitarUrlParadas();
		}
        
    }else{
        show_noty('Selecciona un horario', 'alert');
    }
}     


function seleccionarRuta(valor){
	$('.ui-field-contain').css('display','none');

	try {
            Mundo.limpiarPantalla();
        } catch (err) {
            console.log(err)
    }
	// Mundo.limpiarPantalla();


    // Mundo.borrarMarcadores();
    

    Mundo.ruta = JSON.parse(valor);

    
    abrirCerrarModal('block');
}


function show_noty(mensaje, tipo){
    var noty = new Noty({
        text   : mensaje,
        type   : tipo,
        timeout: 3000,
        layout: 'bottomRight',
    }).show();
}


function solicitarUrlParadas(){

	var urlFn = '';

	if(!Mundo.horario)
		Mundo.horario.hora = 2;

    if(Mundo.ruta){
        if(Mundo.ruta.ruta > 0){
            urlFn+= "/ruta/"+Mundo.ruta.ruta+"/horario/"+Mundo.horario.id;
        }else{
            urlFn+= "/sector/"+Mundo.ruta.sector+"/horario/"+Mundo.horario.id;
        }         
        
        Mundo.solicitarParadas(urlFn);

    }else{
        show_noty('Selecciona un horario valido', 'alert');
    }
            
}




/* forward locationChanges to custom function */
AR.context.onLocationChanged = Mundo.cambioLocacion;

// AR.context.onScreenClick = Mundo.onScreenClick;


AR.context.scene.minScalingDistance = 30;
AR.context.scene.maxScalingDistance = 550;
AR.context.scene.scalingFactor = 0.1;