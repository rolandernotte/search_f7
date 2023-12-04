document.addEventListener('deviceready', onDeviceReady, false);

function onDeviceReady() {
    // Cordova est à présent initialisé !

	// Initialisation de Framework7
    var f7App = new Framework7({
        el: '#app',
        routes:[
			// route vers la page de détail
            {
                name: 'details',
                path: '/details/:id',
                url: './pages/details.html'
            }
        ]
    });

    var mainView = f7App.views.create('.view-main');

    // variable globale: réponse de l'API poiSearch
    var storedData;

    // on géolocalise l'appareil
    navigator.geolocation.getCurrentPosition(geolocationSuccess, geolocationError);

    // callback en cas de succès de géolocalisation
    function geolocationSuccess(position){
        var latitude = position.coords.latitude;
        var longitude = position.coords.longitude;
        
        // on fait disparaitre le texte 'searching'
        $('#searching').text('');

        // point terminal de l'API poiSearch de Tomtom
        var apiUrl = 'https://api.tomtom.com/search/2/poiSearch/pizza.json?lat='
                      + latitude + '&lon=' + longitude
                      + '&key=TOMTOM_KEY';
        
        // requête asynchrone vers le point terminal de l'API Tomtom
        $.getJSON(apiUrl, function(data){
            // console.log(data.results[0].poi.name);

            // on sauveagrde la réponse de l'API
            storedData = data;

            // pour chaque élément du tableau results...
            $.each(data.results, function(){
                // console.log(this.poi.name);

                // on clone l'élément de liste de classe template
                // (modèle d'élément de liste)
                var newItem = $('#output li.template')
                                .clone()
                                // on retire la classe template au clone
                                // (puisque le clone n'est pas un modèle)
                                .removeClass('template') 
                                // on rend le clone visible
                                // (en retirant display:none)
                                .show();

                // on injecte le nom de la pizzéria dans l'élément
                $('.item-inner', newItem).text(this.poi.name);

                // on inject l'id tomtom comme valeur de l'attrivut data-id
                newItem.attr('data-id', this.id);

                // on injecte le clone dans la liste de la page
                $('#output ul').append(newItem);


            })
        })

    }

    function geolocationError(error){
        // gérer les erreurs
        // voir aide du plugin geolocation
    }

    // écouteur de l'évènement 'click' sur un bouton de la listview
	$(document).on('click', '#output li', function(){
        // alert('coucou');

        // on récupère la valeur de l'attribut data-id'
        var id = $(this).attr('data-id');

        //  navigue vers la page de détail
		mainView.router.navigate({
            name: 'details',
            params: {id: id}
        });
    })

    // lorsque la page de détail a été initialisée...
	// (son DOM est prêt)
	$(document).on('page:init', '.page[data-name="details"]', function(e){

		// on récupère la page (voir aide de Framework7)
        var page = e.detail;

		// on récupère le paramètre id (voir aide de Framework7)
        var id = page.route.params.id;

        // console.log(id);

        // on récupère dans storedData.results l'index de l'objet dont l'id correspond 
		// au paramètre id récupéré
		$.each(storedData.results, function(index){
            if(this.id == id){
                poiIndex = index;
            }
        })

        // on récupère le nom du lieu
		var name = storedData.results[poiIndex].poi.name;

        // on l'injecte dans la navbar de la page de détail
		$('.page[data-name="details"] .navbar-inner .title').text(name);

        // on récupère l'adresse du lieu
		var address = storedData.results[poiIndex].address.freeformAddress;

        // on l'injecte dans un élément de classe address de la page de detail
		$('.page[data-name="details"] .page-content .address').text(address);

		// s'il existe...
        if(storedData.results[poiIndex].poi.phone != undefined){
            // on récupère le numéro de téléphone
			var tel = storedData.results[poiIndex].poi.phone;
        }
        else{
            var tel = 'Numéro non connu';
        }

		// on l'injecte dans un élément de class tel de la apge de détail
        $('.page[data-name="details"] .page-content .tel').text(tel);


    })
    
}
