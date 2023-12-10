document.addEventListener('deviceready', onDeviceReady, false);

function onDeviceReady() {
    // Cordova est à présent initialisé !

	// On utilise le UI framework Framework7
	// *************************************
	
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
	
	// Application
	// ***********
	var SEARCHAPP = {
	
		// réponse de l'API poiSearch
		storedData: null,
		// latitude et longitude
		latitude: null,
		longitude: null,
		
		// Initialisation
		init: function(){
			// enregistrement des écouteurs
			this.bindings();
			// affichage de la liste des POI
			this.displayList();
		},
		
		displayList: function(){
			// on sauve le contexte de l'app
			var _searchApp = this;
			
			// on géolocalise l'appareil
			navigator.geolocation.getCurrentPosition(geolocationSuccess, geolocationError);

			// callback en cas de succès de géolocalisation
			function geolocationSuccess(position){
				_searchApp.latitude = position.coords.latitude;
				_searchApp.longitude = position.coords.longitude;
				
				// on fait disparaitre le texte 'searching'
				$('#searching').text('');

				// point terminal de l'API poiSearch de Tomtom
				var apiUrl = 'https://api.tomtom.com/search/2/poiSearch/pizza.json?lat='
							  + _searchApp.latitude + '&lon=' + _searchApp.longitude
							  + '&key=SDxukVh1qhhHWpqMypU2G10gbnNbJjdi';
				
				// requête asynchrone vers le point terminal de l'API Tomtom
				$.getJSON(apiUrl, function(data){
					// console.log(data.results[0].poi.name);

					// on sauveagrde la réponse de l'API
					_searchApp.storedData = data;

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

		},
		
		// Ecouteurs d'évènements
		bindings: function(){
			// on sauve le contexte de l'app
			var _searchApp = this;
			
			console.log('coucou');
			
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
				$.each(_searchApp.storedData.results, function(index){
					if(this.id == id){
						poiIndex = index;
					}
				})

				// on récupère le nom du lieu
				var name = _searchApp.storedData.results[poiIndex].poi.name;

				// on l'injecte dans la navbar de la page de détail
				$('.page[data-name="details"] .navbar-inner .title').text(name);

				// on récupère l'adresse du lieu
				var address = _searchApp.storedData.results[poiIndex].address.freeformAddress;

				// on l'injecte dans un élément de classe address de la page de detail
				$('.page[data-name="details"] .page-content .address').text(address);

				// s'il existe...
				if(_searchApp.storedData.results[poiIndex].poi.phone != undefined){
					// on récupère le numéro de téléphone
					var tel = _searchApp.storedData.results[poiIndex].poi.phone;
				}
				else{
					var tel = 'Numéro non connu';
				}

				// on l'injecte dans un élément de class tel de la apge de détail
				$('.page[data-name="details"] .page-content .tel').text(tel);


			})
			
			// pour savoir si le tab a déjà été affiché
			var tabMapNeverDisplayed = true;

			// lorsque le tab-map est chargé...
			// (voir http://framework7.io/docs/tabs.html#tabs-events)
			$('#tab-map').on('tab:show', function(){
				// console.log('coucou');
				
				// si la latitude et la longitude de l'utilisateur ont été récupérées
				if(_searchApp.latitude != undefined && _searchApp.longitude != undefined && tabMapNeverDisplayed){
					
					tabMapNeverDisplayed = false;

					// on initialise la carte avec un centre et un niveau de zoom
					var map = L.map('mapid').setView([_searchApp.latitude, _searchApp.longitude], 13);

					// on affiche une couche de tuiles (qui proviennent de openstreetmap) sur la carte
					L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
						attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
					}).addTo(map);

					// on ajoute le marqueur qui donne notre position
					L.marker([_searchApp.latitude, _searchApp.longitude]).addTo(map)
													.bindPopup('Votre position')
													.openPopup();

					// icône pour marqueur vert (bleu par défaut)
					var greenIcon = new L.Icon({
						iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
						shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
						iconSize: [25, 41],
						iconAnchor: [12, 41],
						popupAnchor: [1, -34],
						shadowSize: [41, 41]
						});
					
					// on ajoute les marqueurs des pizzérias
					$.each(_searchApp.storedData.results, function(){
						// console.log(this.position.lat);
						var lat = this.position.lat;
						var lon = this.position.lon;
						var name = this.poi.name;
						L.marker([lat, lon], {icon: greenIcon}).addTo(map)
											.bindPopup('<a class="popupLink" href="#" data-id="' + this.id + '">' + this.poi.name + '</a>');
					})
				}  
			})			
			
			// on détecte le click sur un lien dans un popup de la carte
			$(document).on('click', '.popupLink', function(){
				// console.log('popup link clicked');
				// console.log($(this).attr('data-id'));

				var id = $(this).attr('data-id');

				// on navigue vers la page de détail
				mainView.router.navigate({
					name: 'details',
					params: {id: id}
				});

			})
			
			
		}
	
	}
	
	SEARCHAPP.init();
    
}
