var filename = 'definite'; //nombre del archivo .mp3 para la notificacion de audio

var kMarker_AnimationDuration_ChangeDrawable = 500;
var kMarker_AnimationDuration_Resize = 1000;

function Marcador(parada) {

    this.parada = parada;
    this.isSelected = false;

    this.notificado = false;

    /*
     With AR.PropertyAnimations you are able to animate almost any property of ARchitect objects. This sample will animate the opacity of both background drawables so that one will fade out while the other one fades in. The scaling is animated too. The marker size changes over time so the labels need to be animated too in order to keep them relative to the background drawable. AR.AnimationGroups are used to synchronize all animations in parallel or sequentially.
     */

    this.animationGroup_idle = null;
    this.animationGroup_selected = null;

    // create the AR.GeoLocation from the poi data
    var markerLocation = new AR.GeoLocation(parada.latitud, parada.longitud, parada.altitud);

    // create an AR.ImageDrawable for the marker in idle state
    this.markerDrawable_idle = new AR.ImageDrawable(Mundo.markerDrawable_idle, 13, {
        zOrder: 0,
        opacity: 1.0,
        /*
         To react on user interaction, an onClick property can be set for each AR.Drawable. The property is a function which will be called each time the user taps on the drawable. The function called on each tap is returned from the following helper function defined in marker.js. The function returns a function which checks the selected state with the help of the variable isSelected and executes the appropriate function. The clicked marker is passed as an argument.
         */
        onClick: Marcador.prototype.getClick(this)
    });

    // create an AR.ImageDrawable for the marker in selected state
    this.markerDrawable_selected = new AR.ImageDrawable(Mundo.markerDrawable_selected, 15, {
        zOrder: 0,
        opacity: 0.0,
        onClick: null
    });


    // create an AR.Label for the marker's title 
    this.titleLabel = new AR.Label(parada.nombre.trunc(10), 1, {
        zOrder: 1,
        translate: {
            y: 0.55
        },
        style: {
            textColor: '#FFFFFF',
            fontStyle: AR.CONST.FONT_STYLE.BOLD
        }
    });


    // create an AR.Label for the marker's description
    this.descriptionLabel = new AR.Label(parada.nombre, 0.8, {
        zOrder: 1,
        translate: {
            y: -0.55
        },
        style: {
            textColor: '#FFFFFF'
        }
    });

    /*
     Create an AR.ImageDrawable using the AR.ImageResource for the direction indicator which was created in the World. Set options regarding the offset and anchor of the image so that it will be displayed correctly on the edge of the screen.
     */
    this.directionIndicatorDrawable = new AR.ImageDrawable(Mundo.markerDrawable_directionIndicator, 0.1, {
        enabled: false,
        verticalAnchor: AR.CONST.VERTICAL_ANCHOR.TOP
    });

    /*
     Create the AR.GeoObject with the drawable objects and define the AR.ImageDrawable as an indicator target on the marker AR.GeoObject. The direction indicator is displayed automatically when necessary. AR.Drawable subclasses (e.g. AR.Circle) can be used as direction indicators.
     */
    this.markerObject = new AR.GeoObject(markerLocation, {


        onEnterFieldOfVision: Marcador.prototype.notificarParada(this),

        drawables: {
            cam: [this.markerDrawable_idle, this.markerDrawable_selected, this.titleLabel, this.descriptionLabel],
            indicator: this.directionIndicatorDrawable
        }
    });


    // show_noty(parada.latitud, 'alert');
    // show_noty(parada.longitud, 'alert');
    // show_noty(parada.altitud, 'alert');

    return this;
}


Marcador.prototype.notificarParada = function(marcador) {

    // show_noty('Marcador: '+marcador.parada.nombre, 'alert');

    if(marcador.notificado == false){ 
        document.getElementById("notificacion-sonido").innerHTML='<audio autoplay="autoplay"><source src="assets/alerta.mp3" type="audio/mpeg" /><source src="alerta.ogg" type="audio/ogg" /><embed hidden="true" autostart="true" loop="false" src="alerta.mp3" /></audio>';
        
        marcador.notificado = true;
    }

    // document.getElementById("notificacion-sonido").innerHTML='';
};




Marcador.prototype.getClick = function(marcador) {

    /*
     The desactivarMarcadores and setDeselected functions are prototype Marker functions.
     Both functions perform the same steps but inverted.
     */

    return function() {

        if (!Marcador.prototype.isAnyAnimationRunning(marcador)) {
            if (marcador.isSelected) {

                Marcador.prototype.desactivarMarcadores(marcador);

                try {
                    Mundo.limpiarPantalla();
                } catch (err) {
                    console.log(err)
                }

            } else {

                Marcador.prototype.activarMarcador(marcador);

                try {
                    Mundo.mostrarDetallesMarcador(marcador);
                } catch (err) {
                    console.log(err)
                }

            }
        } else {
            
            AR.logger.debug('a animation is already running');
        }


        return true;
    };
};

/*
 Property Animations allow constant changes to a numeric value/property of an object, dependent on start-value, end-value and the duration of the animation. Animations can be seen as functions defining the progress of the change on the value. The Animation can be parametrized via easing curves.
 */

Marcador.prototype.activarMarcador = function(marcador) {

    marcador.isSelected = true;

    // New:
    if (marcador.animationGroup_selected === null) {

        // create AR.PropertyAnimation that animates the opacity to 0.0 in order to hide the idle-state-drawable
        var hideIdleDrawableAnimation = new AR.PropertyAnimation(marcador.markerDrawable_idle, "opacity", null, 0.0, kMarker_AnimationDuration_ChangeDrawable);
        // create AR.PropertyAnimation that animates the opacity to 1.0 in order to show the selected-state-drawable
        var showSelectedDrawableAnimation = new AR.PropertyAnimation(marcador.markerDrawable_selected, "opacity", null, 1.0, kMarker_AnimationDuration_ChangeDrawable);

        // create AR.PropertyAnimation that animates the scaling of the idle-state-drawable to 1.2
        var idleDrawableResizeAnimationX = new AR.PropertyAnimation(marcador.markerDrawable_idle, 'scale.x', null, 1.2, kMarker_AnimationDuration_Resize, new AR.EasingCurve(AR.CONST.EASING_CURVE_TYPE.EASE_OUT_ELASTIC, {
            amplitude: 2.0
        }));
        // create AR.PropertyAnimation that animates the scaling of the selected-state-drawable to 1.2
        var selectedDrawableResizeAnimationX = new AR.PropertyAnimation(marcador.markerDrawable_selected, 'scale.x', null, 1.2, kMarker_AnimationDuration_Resize, new AR.EasingCurve(AR.CONST.EASING_CURVE_TYPE.EASE_OUT_ELASTIC, {
            amplitude: 2.0
        }));
        // create AR.PropertyAnimation that animates the scaling of the title label to 1.2
        var titleLabelResizeAnimationX = new AR.PropertyAnimation(marcador.titleLabel, 'scale.x', null, 1.2, kMarker_AnimationDuration_Resize, new AR.EasingCurve(AR.CONST.EASING_CURVE_TYPE.EASE_OUT_ELASTIC, {
            amplitude: 2.0
        }));
        // create AR.PropertyAnimation that animates the scaling of the description label to 1.2
        var descriptionLabelResizeAnimationX = new AR.PropertyAnimation(marcador.descriptionLabel, 'scale.x', null, 1.2, kMarker_AnimationDuration_Resize, new AR.EasingCurve(AR.CONST.EASING_CURVE_TYPE.EASE_OUT_ELASTIC, {
            amplitude: 2.0
        }));

        // create AR.PropertyAnimation that animates the scaling of the idle-state-drawable to 1.2
        var idleDrawableResizeAnimationY = new AR.PropertyAnimation(marcador.markerDrawable_idle, 'scale.y', null, 1.2, kMarker_AnimationDuration_Resize, new AR.EasingCurve(AR.CONST.EASING_CURVE_TYPE.EASE_OUT_ELASTIC, {
            amplitude: 2.0
        }));
        // create AR.PropertyAnimation that animates the scaling of the selected-state-drawable to 1.2
        var selectedDrawableResizeAnimationY = new AR.PropertyAnimation(marcador.markerDrawable_selected, 'scale.y', null, 1.2, kMarker_AnimationDuration_Resize, new AR.EasingCurve(AR.CONST.EASING_CURVE_TYPE.EASE_OUT_ELASTIC, {
            amplitude: 2.0
        }));
        // create AR.PropertyAnimation that animates the scaling of the title label to 1.2
        var titleLabelResizeAnimationY = new AR.PropertyAnimation(marcador.titleLabel, 'scale.y', null, 1.2, kMarker_AnimationDuration_Resize, new AR.EasingCurve(AR.CONST.EASING_CURVE_TYPE.EASE_OUT_ELASTIC, {
            amplitude: 2.0
        }));
        // create AR.PropertyAnimation that animates the scaling of the description label to 1.2
        var descriptionLabelResizeAnimationY = new AR.PropertyAnimation(marcador.descriptionLabel, 'scale.y', null, 1.2, kMarker_AnimationDuration_Resize, new AR.EasingCurve(AR.CONST.EASING_CURVE_TYPE.EASE_OUT_ELASTIC, {
            amplitude: 2.0
        }));

        /*
         There are two types of AR.AnimationGroups. Parallel animations are running at the same time, sequentials are played one after another. This example uses a parallel AR.AnimationGroup.
         */
        marcador.animationGroup_selected = new AR.AnimationGroup(AR.CONST.ANIMATION_GROUP_TYPE.PARALLEL, [hideIdleDrawableAnimation, showSelectedDrawableAnimation, idleDrawableResizeAnimationX, selectedDrawableResizeAnimationX, titleLabelResizeAnimationX, descriptionLabelResizeAnimationX, idleDrawableResizeAnimationY, selectedDrawableResizeAnimationY, titleLabelResizeAnimationY, descriptionLabelResizeAnimationY]);
    }

    // removes function that is set on the onClick trigger of the idle-state marker
    marcador.markerDrawable_idle.onClick = null;
    // sets the click trigger function for the selected state marker
    marcador.markerDrawable_selected.onClick = Marcador.prototype.getClick(marcador);

    // enables the direction indicator drawable for the current marker
    marcador.directionIndicatorDrawable.enabled = true;
    // starts the selected-state animation
    marcador.animationGroup_selected.start();
};

Marcador.prototype.desactivarMarcadores = function(marcador) {

    marcador.isSelected = false;

    if (marcador.animationGroup_idle === null) {

        // create AR.PropertyAnimation that animates the opacity to 1.0 in order to show the idle-state-drawable
        var showIdleDrawableAnimation = new AR.PropertyAnimation(marcador.markerDrawable_idle, "opacity", null, 1.0, kMarker_AnimationDuration_ChangeDrawable);
        // create AR.PropertyAnimation that animates the opacity to 0.0 in order to hide the selected-state-drawable
        var hideSelectedDrawableAnimation = new AR.PropertyAnimation(marcador.markerDrawable_selected, "opacity", null, 0, kMarker_AnimationDuration_ChangeDrawable);
        // create AR.PropertyAnimation that animates the scaling of the idle-state-drawable to 1.0
        var idleDrawableResizeAnimationX = new AR.PropertyAnimation(marcador.markerDrawable_idle, 'scale.x', null, 1.0, kMarker_AnimationDuration_Resize, new AR.EasingCurve(AR.CONST.EASING_CURVE_TYPE.EASE_OUT_ELASTIC, {
            amplitude: 2.0
        }));
        // create AR.PropertyAnimation that animates the scaling of the selected-state-drawable to 1.0
        var selectedDrawableResizeAnimationX = new AR.PropertyAnimation(marcador.markerDrawable_selected, 'scale.x', null, 1.0, kMarker_AnimationDuration_Resize, new AR.EasingCurve(AR.CONST.EASING_CURVE_TYPE.EASE_OUT_ELASTIC, {
            amplitude: 2.0
        }));
        // create AR.PropertyAnimation that animates the scaling of the title label to 1.0
        var titleLabelResizeAnimationX = new AR.PropertyAnimation(marcador.titleLabel, 'scale.x', null, 1.0, kMarker_AnimationDuration_Resize, new AR.EasingCurve(AR.CONST.EASING_CURVE_TYPE.EASE_OUT_ELASTIC, {
            amplitude: 2.0
        }));
        // create AR.PropertyAnimation that animates the scaling of the description label to 1.0
        var descriptionLabelResizeAnimationX = new AR.PropertyAnimation(marcador.descriptionLabel, 'scale.x', null, 1.0, kMarker_AnimationDuration_Resize, new AR.EasingCurve(AR.CONST.EASING_CURVE_TYPE.EASE_OUT_ELASTIC, {
            amplitude: 2.0
        }));
        // create AR.PropertyAnimation that animates the scaling of the idle-state-drawable to 1.0
        var idleDrawableResizeAnimationY = new AR.PropertyAnimation(marcador.markerDrawable_idle, 'scale.y', null, 1.0, kMarker_AnimationDuration_Resize, new AR.EasingCurve(AR.CONST.EASING_CURVE_TYPE.EASE_OUT_ELASTIC, {
            amplitude: 2.0
        }));
        // create AR.PropertyAnimation that animates the scaling of the selected-state-drawable to 1.0
        var selectedDrawableResizeAnimationY = new AR.PropertyAnimation(marcador.markerDrawable_selected, 'scale.y', null, 1.0, kMarker_AnimationDuration_Resize, new AR.EasingCurve(AR.CONST.EASING_CURVE_TYPE.EASE_OUT_ELASTIC, {
            amplitude: 2.0
        }));
        // create AR.PropertyAnimation that animates the scaling of the title label to 1.0
        var titleLabelResizeAnimationY = new AR.PropertyAnimation(marcador.titleLabel, 'scale.y', null, 1.0, kMarker_AnimationDuration_Resize, new AR.EasingCurve(AR.CONST.EASING_CURVE_TYPE.EASE_OUT_ELASTIC, {
            amplitude: 2.0
        }));
        // create AR.PropertyAnimation that animates the scaling of the description label to 1.0
        var descriptionLabelResizeAnimationY = new AR.PropertyAnimation(marcador.descriptionLabel, 'scale.y', null, 1.0, kMarker_AnimationDuration_Resize, new AR.EasingCurve(AR.CONST.EASING_CURVE_TYPE.EASE_OUT_ELASTIC, {
            amplitude: 2.0
        }));

        /*
         There are two types of AR.AnimationGroups. Parallel animations are running at the same time, sequentials are played one after another. This example uses a parallel AR.AnimationGroup.
         */
        marcador.animationGroup_idle = new AR.AnimationGroup(AR.CONST.ANIMATION_GROUP_TYPE.PARALLEL, [showIdleDrawableAnimation, hideSelectedDrawableAnimation, idleDrawableResizeAnimationX, selectedDrawableResizeAnimationX, titleLabelResizeAnimationX, descriptionLabelResizeAnimationX, idleDrawableResizeAnimationY, selectedDrawableResizeAnimationY, titleLabelResizeAnimationY, descriptionLabelResizeAnimationY]);
    }

    // sets the click trigger function for the idle state marker
    marcador.markerDrawable_idle.onClick = Marcador.prototype.getClick(marcador);
    // removes function that is set on the onClick trigger of the selected-state marker
    marcador.markerDrawable_selected.onClick = null;

    // disables the direction indicator drawable for the current marker
    marcador.directionIndicatorDrawable.enabled = false;
    // starts the idle-state animation
    marcador.animationGroup_idle.start();
};

Marcador.prototype.isAnyAnimationRunning = function(marcador) {

    if (marcador.animationGroup_idle === null || marcador.animationGroup_selected === null) {
        return false;
    } else {
        if ((marcador.animationGroup_idle.isRunning() === true) || (marcador.animationGroup_selected.isRunning() === true)) {
            return true;
        } else {
            return false;
        }
    }
};

// will truncate all strings longer than given max-length "n". e.g. "foobar".trunc(3) -> "foo..."
String.prototype.trunc = function(n) {
    return this.substr(0, n - 1) + (this.length > n ? '...' : '');
};