"use strict";
let marker_list = [];

// List of location_list
const location_list = [
    {title: "Gandhi Maidan", location: {lat: 25.61687950677165, lng: 85.14579687308226}},
    {title: "Eden Garden", location: {lat: 22.564541597977065, lng: 88.34329605102539}},
    {title: "City Palace, Jaipur", location: {lat: 26.925489271497494, lng: 75.82434552309178}},
    {title: "Badrinath Temple", location: {lat: 30.53988935917844, lng: 79.5290612332611}},
    {title: "Qutub Minar", location: {lat: 28.525265048263833, lng: 77.18659304744011}},
    {title: "Dr. B.C. Roy Engineering College, Durgapur", location: {lat: 23.542869953024006, lng: 87.34426239748105}}
];

// Initialize data
function Location(data) {
    let self = this;
    self.title = data.title;
    self.location = data.location;
    this.marker = ko.observable();
}

// AppViewModel
function AppViewModel() {
    let self = this;
    self.filter_list = ko.observable('');

    // Style the markers a bit. This will be our listing marker icon.
    const defaultIcon = makeMarkerIcon('0091ff');

    // Create a "highlighted location" marker color for when the user
    // mouses over the marker
    const highlightedIcon = makeMarkerIcon('FFFF24');

    const largeInfowindow = new google.maps.InfoWindow();

    // The following fetch location array to create an array of data on initialize.
    location_list.map(function (i) {
        let location = new Location(i);

        // Create a marker per location, and put into locationlist.
        let marker = new google.maps.Marker({
            position: i.location,
            map: map,
            title: i.title,
            animation: google.maps.Animation.DROP,
            icon: defaultIcon,
            id: i
        });

        // Create an onclick event to open the large infowindow at each marker.
        marker.addListener('click', function () {
            fourSquareApi(marker, location.title, location.location, largeInfowindow, defaultIcon, highlightedIcon);
        });
        location.marker = marker;

        // Push the location to our array of locationlist.
        marker_list.push(location);
    });

    // text input field filters the map markers and list items to location_list matching.
    self.show_places = ko.computed(function () {
        let filter_item = self.filter_list().toLowerCase();
        if (!filter_item) {
            ko.utils.arrayForEach(marker_list, function (items) {
                items.marker.setVisible(true);
            });
            return marker_list;
        } else {
            return ko.utils.arrayFilter(marker_list, function (items) {
                let result = (items.title.toLowerCase().search(filter_item) >= 0);
                // close all infowindow when open
                largeInfowindow.close();
                largeInfowindow.marker = items.marker;
                items.marker.setIcon(defaultIcon);
                items.marker.setVisible(result);
                return result;
            });
        }
    });

    // Clickable event on list to open the large Infowindow at each marker.
    self.showList = function (clickItem) {
        fourSquareApi(clickItem.marker, clickItem.title, clickItem.location, largeInfowindow, defaultIcon, highlightedIcon);
    };
}

// populated infowindow
function fourSquareApi(marker, title, location, infowindow, defaultIcon, highlightedIcon) {
    map.setCenter(location);

    // Check to make sure the infowindow is not already opened on this marker.
    if (infowindow.marker != marker) {

        // Clear the infowindow content to give the streetview time to load.
        infowindow.setContent('');
        infowindow.marker = marker;

        // Make sure the marker property is cleared if the infowindow is closed.
        infowindow.addListener('closeclick', function () {
            marker.setIcon(defaultIcon);
            infowindow.marker = null;
        });

        // Foursquare Api url
        const CLIENT_ID = "JFXG03O2Y0AZENJDTGQONBKHBH33N1522VTR3PGQ1YH3YMCV";
        const CLIENT_SECRET = "SODUZXCPCTBQPG12UAU2OQE0ZJO1QC3ZEWXZCTDL0KNBFBZ5";
        let searchurl = 'https://api.foursquare.com/v2/venues/';
        let searchendpoint = 'search?client_id=' + CLIENT_ID + '&client_secret=' + CLIENT_SECRET + '&ll=' + location.lat + ',' + location.lng + '&query=' + title + '&v=20181215';

        // FourSquare Api Search for Venues
        $.ajax({
            url: searchurl + searchendpoint,
            dataType: 'jsonp',
            success: function (data) {
                let currentVenue = data["response"]["venues"][0];
                let name = currentVenue['name'];
                let formattedAddress = currentVenue['location']['formattedAddress'];
                infowindow.setContent('<div class="info"><h3>' + name + '</h3><hr>' +
                    '<p><span><b>Address:</b></span><br>&emsp;' + formattedAddress + '</p></div>');
            },
            // error handling if foursquare not load.
            error: function () {
                alert('Fail to connect to Foursquare: ');
            }
        });
        // check marker and make default
        marker_list.forEach(function (checkMarker) {
            checkMarker['marker'].setIcon(defaultIcon);
        });

        // make marker highlight
        marker.setIcon(highlightedIcon);

        // Open the infowindow on the correct marker.
        infowindow.open(map, marker);
    }
}

// This function takes in a COLOR, and then creates a new marker
// icon of that color. The icon will be 21 px wide by 34 high, have an origin
// of 0, 0 and be anchored at 10, 34).
function makeMarkerIcon(markerColor) {
    const markerImage = new google.maps.MarkerImage(
        'https://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|' + markerColor +
        '|40|_|%E2%80%A2',
        new google.maps.Size(21, 34),
        new google.maps.Point(0, 0),
        new google.maps.Point(10, 34),
        new google.maps.Size(21, 34));
    return markerImage;
}

// google error handling
const error = function () {
    alert('sorry,\n Check Your Internet Connection or Come back later.');
};

//Initialized Map
function initMap() {
    // Constructor creates a new map - only center and zoom are required.
    map = new google.maps.Map(document.getElementById("map"), {
        center: {lat: 26.285822456, lng: 82.228892521},
        zoom: 6.2
    });
    ko.applyBindings(new AppViewModel());
}
