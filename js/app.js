// Data for map locations
var initialLocations = [
  {title: 'The Coffee Bean Tea Leaf', location: {lat: 33.8459969, lng: -118.0368042}, foursquareId: '4ac65fc1f964a52006b420e3'},
  {title: 'Solid Coffee Roasters', location: {lat: 33.8591264, lng: -118.0732763}, foursquareId: '57c73ed7498e299e2f4950b2'},
  {title: "It's a Grind Coffee House", location: {lat: 33.858996, lng: -118.049271}, foursquareId: '4a8ae9a7f964a520d00a20e3'},
  {title: 'Starbucks', location: {lat: 33.85803, lng: -118.1157}, foursquareId: '4a999abdf964a520612f20e3'},
  {title: 'Sharetea', location: {lat: 33.857939, lng: -118.080388}, foursquareId: '552c2e28498e15f96e3f65de'}
];

/* Maps excercise stuff */
var map;

// Create a new blank array for all the listing markers.
var markers = [];

function initMap() {
  // Constructor creates a new map - only center and zoom are required.
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 33.857939, lng: -118.080388},
    zoom: 14
  });

  var largeInfowindow = new google.maps.InfoWindow();
  var bounds = new google.maps.LatLngBounds();
  // On click animate marker and create window
  this.windowAndAnimation = function(marker) {
    marker.addListener('click', function() {
      bounceAnimation(this);
      populateInfoWindow(this, largeInfowindow);
    });
  };

  // The following group uses the location array to create an array of markers on initialize.
  for (var i = 0; i < initialLocations.length; i++) {
    // Get the position from the location array.
    var position = initialLocations[i].location;
    var title = initialLocations[i].title;
    // Create a marker per location, and put into markers array.
    var marker = new google.maps.Marker({
      map: map,
      position: position,
      title: title,
      animation: google.maps.Animation.DROP,
      id: i
    });
    // Push the marker to our array of markers.
    markers.push(marker);
    // Create an onclick event to open an infowindow at each marker.
    windowAndAnimation(marker);
    bounds.extend(markers[i].position);
  }
  // Extend the boundaries of the map for each marker
  map.fitBounds(bounds);
}

// This function populates the infowindow when the marker is clicked. We'll only allow
// one infowindow which will open at the marker that is clicked, and populate based
// on that markers position.
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
/* End of Maps excercise stuff */

// Bounce animation on click. Used in both initMap and ViewModel
function bounceAnimation(marker) {
    marker.setAnimation(google.maps.Animation.BOUNCE);
    // Stops bouncing animation. Saw on stacks overflow by ScottE
    setTimeout(function () {
        marker.setAnimation(null);
    }, 2100);
}

// Location object. Will store foursquare api data
var Location = function(data, foursquareData) {
  var img_size = '250x250';
  this.title = ko.observable(data.title);
  this.location = ko.observable(data.location);
  this.displayMarker = ko.observable(true);
  this.foursquareId = ko.observable(data.foursquareId);
  this.url = ko.observable(foursquareData.canonicalUrl);
  this.rating = ko.observable(foursquareData.rating);
  this.displayFoursquare = ko.observable(false);
  this.img = ko.observable(foursquareData.bestPhoto.prefix + img_size + foursquareData.bestPhoto.suffix);
};

function ViewModel() {
  var self = this;
  this.searchLocation = ko.observable("");
  this.locationList = ko.observableArray([]);

  // Getting location data from foursquare api
  var foursquareUrl = 'https://api.foursquare.com/v2/venues/';
  var client_id = 'ROOEVLVD2ZBSTY3BYUFG5EZX3JDMOFAVK5INURCTSWSSWNM1';
  var client_secret = 'YTENDFGB4LA2PR2BZ5CW0MSNWPGZXXKCRVAN3HJOKOBQYOAT';
  var v = '20170808';
  var errorEncountered = false;

  // Initializing Location objects
  initialLocations.forEach(function(locationItem) {
    var requestUrl = foursquareUrl + locationItem.foursquareId + '?&client_id='+client_id+'&client_secret='+client_secret+'&v='+v;
    $.getJSON(requestUrl).done(function(data) {
      self.locationList.push( new Location(locationItem, data.response.venue) );
    }).error(function() {
      alert('Foursquare Data has failed to load. Please refresh browser and try again.');
    });
  });

  // Search bar function for narrowing list
  self.findLocation = function() {
    var search = this.searchLocation();
    // Checking to see if search word in title and
    // turn off markers that are not in search
    self.locationList().forEach(function(location) {
      if (~location.title().toUpperCase().indexOf(search.toUpperCase())) {
        location.displayMarker(true);
        markers.forEach(function(marker) {
          if (marker.title === location.title()) {
            marker.setMap(map);
          }
        });
      } else {
        location.displayMarker(false);
        markers.forEach(function(marker) {
          if (marker.title === location.title()) {
            marker.setMap(null);
          }
        });
      }
    });

  };

  // Animates map markers
  self.activateMark = function(location) {
    markers.forEach(function(marker) {
      if (marker.title === location.title()) {
        bounceAnimation(marker);
      }
    });
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
      if (listItem.title() !== location.title()) {
        listItem.displayFoursquare(false);
      }
    });
  };

  // Shows entire list and map markers for show all button
  self.showAll = function() {
    self.locationList().forEach(function(location) {
      location.displayMarker(true);
    });
    markers.forEach(function(marker) {
      marker.setMap(map);
    });
  };
}


ko.applyBindings(new ViewModel());
