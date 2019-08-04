var rutas = null;
var horarios = null;

var url = "http://192.168.2.101:8000";


$(document).ready(function(){
	

	
	$.get(url+"/rutas/horarios", 
		function(data) {

		put_rutas_options(data.sedes)
		put_horarios_radio_buttons(data.horarios);
	});



	function put_rutas_options(sedesFn){
		var select = $('#select-rutas');
		var sedes = sedesFn;

		$.each(sedes, function(index, element) {
			var sede = element;

			$.each(sede.sectores, function(index, element) {
				var sector = element;

				// select.append("<optgroup label='"+sede.nombre+" - "+sector.nombre+"' id='op'"+sector.id+"'>");
				select.append("<optgroup label='"+sector.nombre+"' id='op'"+sector.id+"'>");

				$.each(sector.rutas, function(index, element) {

					var ruta = element;

					var ruta_valor = { "sector": sector.id, "ruta":ruta.id};

					select.append("<option value='"+JSON.stringify(ruta_valor)+"'>" + ruta.nombre + "</option>");
				});
					
				var sector_valor = { "sector": sector.id, "ruta":0};

				select.append("<option value='"+JSON.stringify(sector_valor)+"'>Todas este sector</option>");
				select.append("</optgroup>");
			});
		});

		$('.ui-field-contain').css('display','block');

		// quitarLoading(); //Para quitar el loading.gif - La funcion esta en el index.html
	}



	function put_horarios_radio_buttons(horarios){

		var horarios_opciones = $('.ui-controlgroup-controls');

		$.each(horarios, function(index, element) {

			var horario = element;
			var horario_valor = { "id": horario.id, "hora":horario.hora, "periodo": horario.periodo};

			horarios_opciones.append("<div class='no-ui-btn'><input type='radio' name='horario' id='radio-choice-"+(index+1)+"' value='"+JSON.stringify(horario_valor)+"'><label for='radio-choice-"+(index+1)+"'>"+horario.hora+" "+horario.periodo+"</label></div>");

		});

	}


});
