// Data for map locations
var initialLocations = [
  {title: 'The Coffee Bean Tea Leaf', location: {lat: 33.8459969, lng: -118.0368042}, foursquareId: '4ac65fc1f964a52006b420e3'},
  {title: 'Solid Coffee Roasters', location: {lat: 33.8591264, lng: -118.0732763}, foursquareId: '57c73ed7498e299e2f4950b2'},
  {title: "It's a Grind Coffee House", location: {lat: 33.858996, lng: -118.049271}, foursquareId: '4a8ae9a7f964a520d00a20e3'},
  {title: 'Starbucks', location: {lat: 33.85803, lng: -118.1157}, foursquareId: '4a999abdf964a520612f20e3'},
  {title: 'Sharetea', location: {lat: 33.857939, lng: -118.080388}, foursquareId: '552c2e28498e15f96e3f65de'}
];

// Create window when marker clicked
function populateInfoWindow(marker, infowindow) {
  // Check to make sure the infowindow is not already opened on this marker.
  if (infowindow.marker != marker) {
    infowindow.marker = marker;
    infowindow.setContent('<div>' + marker.title + '</div>');
    infowindow.open(map, marker);
    // Make sure the marker property is cleared if the infowindow is closed.
    infowindow.addListener('closeclick',function(){
      infowindow.setMarker = null;
    });
  }
}

// Bounce animation on click. Used in both initMap and ViewModel
function bounceAnimation(marker) {
  marker.setAnimation(google.maps.Animation.BOUNCE);
  // Stops bouncing animation. Saw on stacks overflow by ScottE
  setTimeout(function () {
      marker.setAnimation(null);
  }, 2100);
}

// Error handling for google maps
function mapsError() {
  alert('Google Maps failed to load. Please refresh browser and try again.')
}

// Location object. Will store foursquare api data
var Location = function(initialLocData, foursquareData, map) {
  var img_size = '250x250';
  this.title = initialLocData.title;
  this.location = initialLocData.location;
  this.displayLocation = ko.observable(true);
  this.foursquareId = initialLocData.foursquareId;
  this.url = foursquareData.canonicalUrl;
  this.rating = foursquareData.rating;
  this.displayFoursquare = ko.observable(false);
  this.img = foursquareData.bestPhoto.prefix + img_size + foursquareData.bestPhoto.suffix;
  this.marker = new google.maps.Marker({
    map: map,
    position: initialLocData.location,
    title: initialLocData.title,
    animation: google.maps.Animation.DROP,
  });
};

function ViewModel() {
  var map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 33.857939, lng: -118.080388},
    zoom: 14
  });
  var largeInfowindow = new google.maps.InfoWindow();
  var bounds = new google.maps.LatLngBounds();
  var self = this;
  this.searchLocation = ko.observable("");
  this.locationList = ko.observableArray([]);

  // Getting location data from foursquare api
  var foursquareUrl = 'https://api.foursquare.com/v2/venues/';
  var client_id = 'ROOEVLVD2ZBSTY3BYUFG5EZX3JDMOFAVK5INURCTSWSSWNM1';
  var client_secret = 'YTENDFGB4LA2PR2BZ5CW0MSNWPGZXXKCRVAN3HJOKOBQYOAT';
  var v = '20170808';
  var errorEncountered = false;
  var markerCount = 0;
  var bounds = new google.maps.LatLngBounds();

  // Initializing Location objects
  initialLocations.forEach(function(locationItem) {
    var requestUrl = foursquareUrl + locationItem.foursquareId + '?&client_id='+client_id+'&client_secret='+client_secret+'&v='+v;

    $.getJSON(requestUrl).done(function(data) {
      var locationObject = new Location(locationItem, data.response.venue, map);
      self.locationList.push( locationObject );
      self.addBounds(locationObject.marker.position);
      // Add event listener for markers
      locationObject.marker.addListener('click', function() {
        self.activateFoursquareInfo(locationObject);
      });
    }).error(function() {
      alert('Foursquare Data has failed to load. Please refresh browser and try again.');
    });
  });

  // Create boundary for google maps
  self.addBounds = function(position) {
    markerCount+=1
    bounds.extend(position);
    // Only does fitBounds when all markers have been iterated
    if (markerCount === initialLocations.length) {
      map.fitBounds(bounds);
    }
  }

  // Search bar function for narrowing list
  self.findLocation = function() {
    var search = this.searchLocation();
    /* Checking to see if search word in title and
       turn off markers that are not in search */
    self.locationList().forEach(function(location) {
      if (~location.title.toUpperCase().indexOf(search.toUpperCase())) {
        location.displayLocation(true);
        location.marker.setVisible(true);
      } else {
        location.displayLocation(false);
        location.marker.setVisible(false);
        location.displayFoursquare(false);
      }
    });
  }

  // Animates map markers
  self.activateMark = function(location) {
    bounceAnimation(location.marker);
  };

  // Animates marker. Shows foursquare info. Opens and closes upon click
  self.activateFoursquareInfo = function(location) {
    self.activateMark(location);
    if (location.displayFoursquare() === true) {
      location.displayFoursquare(false);
    } else {
      location.displayFoursquare(true);
    }
    self.locationList().forEach(function(listItem) {
      if (listItem.title !== location.title) {
        listItem.displayFoursquare(false);
      }
    });
  };

  // Shows entire list and map markers for show all button
  self.showAll = function() {
    self.locationList().forEach(function(location) {
      location.displayLocation(true);
      location.marker.setVisible(true);
    });
  };
}

function initApp() {
  ko.applyBindings(new ViewModel());
}
