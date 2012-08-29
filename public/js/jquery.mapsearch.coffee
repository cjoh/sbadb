$ = jQuery

$.fn.extend
  mapSearch: (options) ->
    el = this;

    settings =
      initial_coordinates: [40, -100]
      initial_zoom: 4
      tile_layer: 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
      per_page: 10
      geo_params: ['ne_lat', 'ne_lng', 'sw_lat', 'sw_lng']
      json_selector: ''
      result_params:
        id: 'id'
        latlng: (result) ->
          [result.latitude, result.longitude]
      ajax:
        url: ''
        type: 'GET'

    settings = $.extend settings, options

    map = L.map(el[0]).setView(settings.initial_coordinates, settings.initial_zoom)
    L.tileLayer(settings.tile_layer).addTo(map);

    console.log('initialized with settings:')
    console.log(settings)

    makeAjaxRequest = () ->
      $.ajax
        url: settings.ajax.url
        type: settings.ajax.method
        success: (data) ->
          if settings.json_selector
            processResults(data[settings.json_selector])
          else
            processResults(data)

    processResults = (results) ->
      $(results).each (key, result) ->
        L.marker(settings.result_params.latlng(result)).addTo(map);

    map.on 'dragend zoomend', () ->
      makeAjaxRequest()

    arguments.callee.checkSettings = () =>
      console.log(settings)
