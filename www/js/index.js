// Ecouteur de l'évènement 'deviceready' lancé par Cordova
document.addEventListener('deviceready', onDeviceReady, false);

// callback déclenché lorsque l'évènement 'deviceredy' est reçu
function onDeviceReady() {
    // Cordova is now initialized. Have fun!

    // on initialise Framework7
	var f7App = new Framework7({
		root: '#app',
		routes : [
			{
				name: 'details',
				path: '/detail/:id',
				url: './pages/details.html'
			}
		]
	})
	// on crée la vue principale de Framewor7
	var mainView = f7App.views.create('.view-main');
	
	// on géolocalise le device
	navigator.geolocation.getCurrentPosition(geolocationSuccess, geolocationError);
	
	// callback déclenché en cas de succès de géolocalisation
	function geolocationSuccess(position){
		// on récupère la latitude et la longitude dans des propriétés de l'objet position
		// reçu automatiquement en paramètre par la fonction
		var latitude = position.coords.latitude;
		var longitude = position.coords.longitude;
		
		// url du point terminal venues/search de l'API Foursquare Places
		var apiUrl = 'https://api.foursquare.com/v2/venues/search?ll=' + latitude + ',' + longitude +'&query=pizza&radius=5000&client_id=YOUR_CLIENT_ID&client_secret=YOUR_CLIENT_SECRET&v=20201125';
		
		// requête asynchrone de type GET vers le point terminal de l'API Foursquare Places
		$.getJSON(apiUrl, function(data){
			
			// console.log(data.response.venues[0].name);
			
			// ici, on est certain d'avoir reçu une réponse de l'API dans l'objet data 
			// (sans erreur)
			
			// on supprime le message d'attente
			$('#output #searching').text('');
			
			// pour chaque lieu d'intérêt dans le tableau venues...
			$.each(data.response.venues, function(){
				
				// console.log(this.name);
				
				// ... on clone le modèle d'élément de liste
				var newItem = $('#output li.template').clone();
				
				// on lui enlève la classe 'template', puisqu'il ne s'agit plus du modèle 
				// et on l'affiche (on va contre le style display:none du modèle)
				newItem.removeClass('template').show();
				
				// on donne un contenu (le nom du lieu d'intérêt) à l'élément de liste clôné 
				$('.item-inner', newItem).text(this.name);
				
				// on place l'id Foursquare du lieu dans l'attribut data-id
				newItem.attr('data-id', this.id);
				
				// on injecte le clône dans la listview de la page
				newItem.appendTo('#output ul');
				
			})
			
		})
		
	}
	
	// callback déclenché en cas d'échec de la géolocalisation
	function geolocationError(error){
		alert('code: '    + error.code    + '\n' + 'message: ' + error.message + '\n');
	}
	
	// écouteur d'évènement (click sur un bouton de la ListView)
	$(document).on('click', '#output li', function(){
		// alert('coucou');
		
		// on récupère la valeur de l'attribut data-id
		// id représente donc l'identifiant Foursquare du lieu d'intérêt
		var id = $(this).attr('data-id');
		// console.log(id);
		
		// on navigue vers la page de détail en lui passant l'id Foursquare
		// dans un paramètre nommé id
		mainView.router.navigate({
			name: 'details',
			params: {id: id}
		});	
	})
	
	// lorsque la page de détail a été initialisée...
	// (page:init est un évènement F7)
	$(document).on('page:init', '.page[data-name="details"]', function(e){
		// ici, le DOM de la page de détail est prêt
		
		// on récupère la page (voir aide Framework7)
		var page = e.detail;
		
		// on récupère le paramètre id transmis à la page
		// (voir aide Framework7)
		var id = page.route.params.id;
		
		// on récupère l'élément racine de la page de détail
		// (voir aide de Framework7)
		var pageDom = page.el;
		
		// console.log(id);
		
		// on construit la requête de type Detail vers l'API Foursquare
		var apiUrl = 'https://api.foursquare.com/v2/venues/' + id +'?client_id=YOUR_CLIENT_ID&client_secret=YOUR_CLIENT_SECRET&v=20191112';
		
		// on lance la requête asynchrone
		$.getJSON(apiUrl, function(data){
			// lorsque la réponse est reçue...
			
			// on récupère le nom du lieu
			var name = data.response.venue.name;
			// on l'injecte dans la navbar
			$('.navbar .title').text(name);
			
			// on récupère le numéro de téléphone
			if(data.response.venue.contact.phone !== undefined){
				var phone = data.response.venue.contact.phone;
				// on l'injecte dans un élément de classe 'tel'
				$('.page-content .tel', pageDom).html(phone);
			}
			else{
				$('.page-content .tel', pageDom).text('numéro non connu');
			}
			
			// on récupère l'adresse formatée (il s'agit d'un tableau)
			if(data.response.venue.location.formattedAddress !== undefined){
				var formattedAddress = data.response.venue.location.formattedAddress;
				
				// on crée un string qui représente l'adresse
				var l =formattedAddress.length;
				var address = '';
				for(var i=0; i<l; i++){
					address = address + formattedAddress[i] + '<br>';
				}
				
				// on l'injecte dans un élément de classe 'address'
				$('.page-content .address', pageDom).html(address);
			}
			else{
				$('.page-content .address', pageDom).text('adresse non connue');
			}
			
			// si les heures d'ouverture sont connues
			if(data.response.venue.hours != undefined){
				var timeframes = data.response.venue.hours.timeframes;
				var l = data.response.venue.hours.timeframes.length;
				var hours = '';
				for(var i=0; i<l; i++){
					hours += timeframes[i].days + ': ';
					for(var j=0; j<timeframes[i].open.length; j++){
						if(j == timeframes[i].open.length-1){
							hours += timeframes[i].open[j].renderedTime;
						}
						else{
							hours += timeframes[i].open[j].renderedTime + '; ';
						}
					}
					hours += '<br/>';
				};
				$('.page-content .hours', pageDom).html(hours);
			}
			else{
				$('.page-content .hours', pageDom).text("heures d'ouverture non connues");
			}
			
		})
		
	})
	
}