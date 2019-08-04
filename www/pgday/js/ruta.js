var rutas_data = [
                    {
                        id: 1,
                        nombre: '1S',
                        zona: 'San Félix'
                    },
                    {
                        id: 2,
                        nombre: '2S',
                        zona: 'San Félix'
                    },
                    {
                        id: 3,
                        nombre: '3S',
                        zona: 'San Félix'
                    },
                    {
                        id: 4,
                        nombre: '4S',
                        zona: 'San Félix'
                    },
                    {
                        id: 5,
                        nombre: '5S',
                        zona: 'San Félix'
                    },
                    {
                        id: 6,
                        nombre: '6S',
                        zona: 'San Félix'
                    },
                    {
                        id: 7,
                        nombre: '7S',
                        zona: 'San Félix'
                    },
                    {
                        id: 8,
                        nombre: '8S',
                        zona: 'San Félix'
                    },
                    {
                        id: 9,
                        nombre: '9S',
                        zona: 'San Félix'
                    },
                    {
                        id: 10,
                        nombre: '10S',
                        zona: 'San Félix'
                    },
                    {
                        id: 11,
                        nombre: '11S',
                        zona: 'San Félix'
                    },
                    {
                        id: 12,
                        nombre: '12S',
                        zona: 'San Félix'
                    },
                    {
                        id: 13,
                        nombre: '13S',
                        zona: 'San Félix'
                    },

                    {
                        id: 14,
                        nombre: '2P',
                        zona: 'Puerto Ordaz'
                    },
                    {
                        id: 15,
                        nombre: '2P',
                        zona: 'Puerto Ordaz'
                    },
                    {
                        id: 16,
                        nombre: '2P',
                        zona: 'Puerto Ordaz'
                    },
                    {
                        id: 17,
                        nombre: '4P',
                        zona: 'Puerto Ordaz'
                    },
                    {
                        id: 18,
                        nombre: '5P',
                        zona: 'Puerto Ordaz'
                    },
                    {
                        id: 19,
                        nombre: '6P',
                        zona: 'Puerto Ordaz'
                    },
                    {
                        id: 20,
                        nombre: '7P',
                        zona: 'Puerto Ordaz'
                    },
                    {
                        id: 21,
                        nombre: '8P',
                        zona: 'Puerto Ordaz'
                    },
                    {
                        id: 22,
                        nombre: '9P',
                        zona: 'Puerto Ordaz'
                    }
                ];



function Ruta(ruta) {

	this.id = null;
	this.nombre = null;
    this.zona = null;
	this.pdi_lista = [];
    

    var result = $.grep(rutas_data, function(e){ return e.id == ruta; });


	if (result.length > 0) {
	  	this.id = result[0].id;
		this.nombre = result[0].nombre;
        this.zona = result[0].zona;

		this.pdiLista = Ruta.prototype.buscarPdis(this);
	}

    return this;
}



Ruta.prototype.buscarPdis = function(ruta) {
	return Pdi.getPdis(ruta.id);
}

