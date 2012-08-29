(function(){

  $("#map").mapSearch({
    json_selector: 'results',
    ajax: {
      url: '/v1/bizs'
    },
    result_params: {
      id: 'user_id',
      latlng: function(result){
        return [result.latlon[1], result.latlon[0]]
      }
    }
  });

/*
var map = L.map('map').setView([40,-100], 4),
    markers = new Array();

L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

var clearMarkers = function() {
  $(markers).each(function(){
    map.removeLayer(this)
  })
}

var clearResults = function() {
  $("ul#results").html('');
}

var findBizs = function() {

  var miles = (map.getBounds()._northEast.lng - map.getBounds()._southWest.lng) * 69,
      center = map.getCenter();

  var url = "/v1/bizs?near=" + center.lng + "," + center.lat  + '&radius=' + miles;

  if ($("input[name=naicscd]").val() !== "") {
    url += "&naics.naicscd=";
    if ($("select[name=naics-all]").val() == "true") url += "{all}";
    url += $("input[name=naicscd]").val();
  }

  var booleans = ['rgstrtnccrind', 'vietnam', 'dav', 'veteran', 'women', 'exportcd', 'edi', 'gcc'];

  $(booleans).each(function(_, val){
    if($("input[name=" + val + "]").is(":checked")) {
      url += "&" + val + "=true";
    }
  });

  $.ajax({
    url: url,
    type: 'GET',
    dataType: 'json',
    success: function(data) {
      clearMarkers();
      clearResults();
      $("#results-count").html(data.meta.count + ' matches');
      for(var i = 0, len = data.results.length; i < len; i++) {
        var biz = data.results[i];
        var marker = L.marker([biz.latlon[1], biz.latlon[0]]).addTo(map);

        var popupContent = "Name: " + biz.name + "<br /><br />Naics codes: ",
            codes = "";

        $(biz.naics).each(function(){ codes += this.naicscd + ", "; })
        if (codes)popupContent += codes.slice(0, -2);

        marker.bindPopup(popupContent);

        $("ul#results").append('<li data-id="' + biz.user_id + '"><pre>' + JSON.stringify(biz, undefined, 2) + '</pre></li>');

        markers.push(marker);
      }
    }
  });

}

map.on('viewreset, dragend, zoomend', function(){
  var miles = (map.getBounds()._northEast.lng - map.getBounds()._southWest.lng) * 69,
      center = map.getCenter();
  findBizs(center.lat, center.lng, miles);
});

$(document).on("submit", "form", function(e){
  e.preventDefault();

  var address = $("input[name=address]").val();
  if (address === "") return findBizs();

  $.getJSON('http://50.17.218.115/street2coordinates/'+address+'?callback=?', function(json){
    var results = json[Object.keys(json)[0]];
    if (results === null) return alert("Couldn't find address.");
    map.setView([results.latitude, results.longitude], 10);
  });

});


$(function(){
  $("form").submit();
});*/

}).call(this);