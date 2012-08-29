$ = jQuery

$.fn.extend
  mapSearch: (options) ->
    el = this;

    settings =
      initial_coordinates: [40, -100]
      initial_zoom: 4
      tile_layer: 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
      geo_params:
        ne_lat: (map) -> map.getBounds().getNorthEast().lat
        ne_lng: (map) -> map.getBounds().getNorthEast().lng
        sw_lat: (map) -> map.getBounds().getSouthWest().lat
        sw_lng: (map) -> map.getBounds().getSouthWest().lng
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
    L.tileLayer(settings.tile_layer).addTo(map)
    markers = []

    current_params = {}

    # ====================================================
    # Make the call to your API
    # ----------------------------------------------------
    makeAjaxRequest = (new_params) ->
      request_params = new_params || current_params

      for key, func of settings.geo_params
        request_params[key] = func(map)

      console.log settings.ajax.url + "?" + $.param(request_params)

      $.ajax
        url: settings.ajax.url + "?" + $.param(request_params)
        type: settings.ajax.method
        success: (data) ->
          if settings.json_selector
            processResults(data[settings.json_selector])
          else
            processResults(data)

    # ====================================================
    # Process the returned json
    # ----------------------------------------------------
    processResults = (results) ->
      map.removeLayer(marker) for marker in markers

      $(results).each (key, result) ->
        markers.push L.marker(settings.result_params.latlng(result)).addTo(map)

    # ====================================================
    # Attach event handlers
    # ----------------------------------------------------
    map.on 'dragend zoomend', () ->
      makeAjaxRequest()

    set_view = arguments.callee.set_view = (latlng, zoom) ->
      map.setView(latlng, zoom)
      update();

    update = arguments.callee.update = (new_params) =>
      makeAjaxRequest(new_params)

    change_page = arguments.callee.change_page = (page) =>
      makeAjaxRequest($.extend current_params, {page: page})
