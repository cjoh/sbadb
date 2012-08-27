var map = L.map('map').setView([40,-100], 4),
    markers = new Array();
L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

var clearMarkers = function() {
  $(markers).each(function(){
    map.removeLayer(this)
  })
}

var findBizs = function(lat, lng, radius) {

  var url = "/v1/bizs?near=" + lng + "," + lat  + '&radius=' + radius;

  if ($("input[name=naicscd]").val() != "") {
    console.log('adding')
    url += "&naics.naicscd=";
    if ($("select[name=naics-all]").val() == "true") url += "{all}";
    url += $("input[name=naicscd]").val();
  }


  console.log(url)
  $.ajax({
    url: url,
    type: 'GET',
    dataType: 'json',
    success: function(data) {
      clearMarkers();
      $("#results-count").html(data.results.length + ' matches');
      for(var i = 0, len = data.results.length; i < len; i++) {
        var biz = data.results[i];
        var marker = L.marker([biz.latlon[1], biz.latlon[0]]).addTo(map);

        var popupContent = "Name: " + biz.name + "<br /><br />Naics codes: ",
            codes = "";

        $(biz.naics).each(function(){
          codes += this.naicscd + ", ";
        })

        if (codes) {
          popupContent += codes.slice(0, -2);
        }

        marker.bindPopup(popupContent);
        markers.push(marker);
      }
    }
  });

}

map.on('viewreset', function(){
  var miles = (map.getBounds()._northEast.lng - map.getBounds()._southWest.lng) * 69,
      center = map.getCenter();
  findBizs(center.lat, center.lng, miles);
})

$(function(){

  $("form").submit(function(e){
    e.preventDefault();

    var address = $("input[name=address]").val();
    if (address === "") {
      var miles = (map.getBounds()._northEast.lng - map.getBounds()._southWest.lng) * 69;
      map.setView([40, -100], 4);
      return findBizs(40, -100, miles);
    }

    $.getJSON('http://50.17.218.115/street2coordinates/'+address+'?callback=?', function(json){
      var results = json[Object.keys(json)[0]];
      if (results === null) {
        return alert("Couldn't find address.");
      }

      map.setView([results.latitude, results.longitude], 10);
      var miles = (map.getBounds()._northEast.lng - map.getBounds()._southWest.lng) * 69;
      findBizs(results.latitude, results.longitude, miles);
    });
  });

  map.fire('viewreset')
})