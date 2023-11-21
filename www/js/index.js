document.addEventListener('deviceready', onDeviceReady, false);

function onDeviceReady() {
    // Cordova est à présent initialisé !

	// Initialisation de Framework7
    var f7App = new Framework7({
        el: '#app'
    });

    var mainView = f7App.views.create('.view-main');

    // géolocalisation
    navigator.geolocation.getCurrentPosition(geolocationSuccess, geolocationError);

    function geolocationSuccess(position){
        // latitude et longitude récupérées
        var latitude = position.coords.latitude;
        var longitude = position.coords.longitude;
        
        // URL pour requête vers le point terminal poiSearch de l'API tomtom Search
        var apiUrl='https://api.tomtom.com/search/2/poiSearch/pizza.json?lat=' + latitude + '&lon=' + longitude + '&radius=5000&key=TOMTOM_KEY';

        // requête asynchrone vers l'API RESTfull
        $.getJSON(apiUrl, function(data){
            // console.log(data.results[0].poi.name);

            // on 'efface' le texte 'Searchin...' puisqu'on a reçu les données
            $('#output #searching').text('');

            // on parcourt le tableau result (tableau d'objets, chaque objet donne des infos sur une pizzéria)
            $.each(data.results, function(){
                // pour chaque pizzéria...
                // on clone le template
                var newItem = $('#output li.template').clone().removeClass('template').show();
                // on injecte le nom de la pizzéria dans ce clone
                $('.item-inner', newItem).text(this.poi.name);
                // on injecte le clone dans la liste de la page
                newItem.appendTo('#output ul');
            })   

        })


    }

    function geolocationError(error){

    }

}
