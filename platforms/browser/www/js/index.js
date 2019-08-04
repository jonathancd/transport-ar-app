
var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },

    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },

    onDeviceReady: function() {

        app.wikitudePlugin = cordova.require("com.wikitude.phonegap.WikitudePlugin.WikitudePlugin");
        var launchDemoButton = document.getElementById('gotoapp-btn');
        launchDemoButton.onclick = function() {
            app.loadARchitectWorld();
        }
    },
    loadARchitectWorld: function() {
        app.wikitudePlugin.isDeviceSupported(function() {
            app.wikitudePlugin.loadARchitectWorld(function successFn(loadedURL) {
                    // alert("Arquitectura cargada");

                }, function errorFn(error) {
                    alert('Loading AR web view failed: ' + error);
                },
                cordova.file.dataDirectory + 'www/pgday/index.html', [ '2d_tracking' ], { camera_position: 'back' }

            );
        }, function(errorMessage) {
            // alert(errorMessage);
        },
        [ '2d_tracking' ]
        );
    }


};






