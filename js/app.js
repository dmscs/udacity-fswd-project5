// Data for map locations
var initialLocations = [
  {title: 'Park Ave Penthouse', location: {lat: 40.7713024, lng: -73.9632393}},
  {title: 'Chelsea Loft', location: {lat: 40.7444883, lng: -73.9949465}},
  {title: 'Union Square Open Floor Plan', location: {lat: 40.7347062, lng: -73.9895759}},
  {title: 'East Village Hip Studio', location: {lat: 40.7281777, lng: -73.984377}},
  {title: 'TriBeCa Artsy Bachelor Pad', location: {lat: 40.7195264, lng: -74.0089934}},
  {title: 'Chinatown Homey Space', location: {lat: 40.7180628, lng: -73.9961237}}
];

var Location = function(data) {
  this.title = ko.observable(data.title);
  this.location = ko.observable(data.location);
  this.display = ko.observable(true);

}




/* Maps excercise stuff */
var map;

// Create a new blank array for all the listing markers.
var markers = [];

function initMap() {
  // Constructor creates a new map - only center and zoom are required.
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 40.7413549, lng: -73.9980244},
    zoom: 13
  });

  // These are the real estate listings that will be shown to the user.
  // Normally we'd have these in a database instead.
  var locations = [
    {title: 'Park Ave Penthouse', location: {lat: 40.7713024, lng: -73.9632393}},
    {title: 'Chelsea Loft', location: {lat: 40.7444883, lng: -73.9949465}},
    {title: 'Union Square Open Floor Plan', location: {lat: 40.7347062, lng: -73.9895759}},
    {title: 'East Village Hip Studio', location: {lat: 40.7281777, lng: -73.984377}},
    {title: 'TriBeCa Artsy Bachelor Pad', location: {lat: 40.7195264, lng: -74.0089934}},
    {title: 'Chinatown Homey Space', location: {lat: 40.7180628, lng: -73.9961237}}
  ];

  var largeInfowindow = new google.maps.InfoWindow();
  var bounds = new google.maps.LatLngBounds();

  // The following group uses the location array to create an array of markers on initialize.
  for (var i = 0; i < locations.length; i++) {
    // Get the position from the location array.
    var position = locations[i].location;
    var title = locations[i].title;
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
    marker.addListener('click', function() {
      bounceAnimation(this);
      populateInfoWindow(this, largeInfowindow);
    });
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

function ViewModel() {
  var self = this;
  this.searchLocation = ko.observable("");
  this.locationList = ko.observableArray([]);

  initialLocations.forEach(function(locationItem) {
    self.locationList.push( new Location(locationItem) );
  });

  // Search bar function for narrowing list
  this.findLocation = function() {
    var search = this.searchLocation();
    // Checking to see if search word in title and
    // turn off markers that are not in search
    self.locationList().forEach(function(location) {
      if (~location.title().toUpperCase().indexOf(search.toUpperCase())) {
        location.display(true);
      } else {
        location.display(false);
        markers.forEach(function(marker) {
          if (marker.title === location.title()) {
            marker.setMap(null);
          }
        })
      }
    });

  };

  // Animates map markers
  this.activateMark = function(location) {
    markers.forEach(function(marker) {
      if (marker.title === location.title()) {
        bounceAnimation(marker);
      }
    });
  }

  // Shows entire list and map markers again
  this.showAll = function() {
    self.locationList().forEach(function(location) {
      location.display(true);
    });
    markers.forEach(function(marker) {
      marker.setMap(map);
    })
  }
};

// Bounce animation
function bounceAnimation(marker) {
    marker.setAnimation(google.maps.Animation.BOUNCE);
    // Stops bouncing animation. Saw on stacks overflow by ScottE
    setTimeout(function () {
        marker.setAnimation(null);
    }, 2100);
}

ko.applyBindings(new ViewModel());
