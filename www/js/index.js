// Ecouteur de l'évènement 'deviceready' lancé par Cordova
document.addEventListener('deviceready', onDeviceReady, false);

// callback déclenché lorsque l'évènement 'deviceredy' est reçu
function onDeviceReady() {
    // Cordova is now initialized. Have fun!

    // on initialise Framework7
	var f7App = new Framework7({
		root: '#app'
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
				// et on l'affiche (on va contre le style display:none du modèle
				newItem.removeClass('template').show();
				
				// on donne un contenu (le nom du lieu d'intérêt) à l'élément de liste clôné 
				// puis on l'injecte dans la liste
				$('.item-inner', newItem).text(this.name);
				newItem.appendTo('#output ul');
				
			})
			
		})
		
	}
	
	// callback déclenché en cas d'échec de la géolocalisation
	function geolocationError(error){
		alert('code: '    + error.code    + '\n' + 'message: ' + error.message + '\n');
	}
	
}