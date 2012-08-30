$(function(){
  $("#mapsearch-map").mapSearch({
    request_uri: '/v1/bizs',
    response_params_id: 'user_id',
    response_params_latlng: function(result){
      return [result.latlon[1], result.latlon[0]]
    }
  });

  $("#mapsearch-map").mapSearch.update();
});

$(document).on("submit", "form", function(e){
  e.preventDefault();

  var address = $("input[name=address]").val();
  var params = {};
  var booleans = ['rgstrtnccrind', 'vietnam', 'dav', 'veteran', 'women', 'exportcd', 'edi', 'gcc'];

  $(booleans).each(function(_, val){
    if($("input[name=" + val + "]").is(":checked")) {
      params[val] = "true";
    }
  });

  if (address && address !== "") {
    $.getJSON('http://50.17.218.115/street2coordinates/'+address+'?callback=?', function(json){
      var results = json[Object.keys(json)[0]];
      if (results === null) return alert("Couldn't find address.");
      $("#map").mapSearch.set_view([results.latitude, results.longitude], 10, false);
      $("#map").mapSearch.update(params);
    });
  } else {
    $("#mapsearch-map").mapSearch.update(params);
  }

});