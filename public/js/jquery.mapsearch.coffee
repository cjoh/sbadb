$ = jQuery

$.fn.extend
  mapSearch: (options) ->

    settings =

      # Initial map lat/lng.
      initial_coordinates: [40, -100]

      # Intial map zoom.
      initial_zoom: 4

      # Leaflet tile layer.
      tile_layer: 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'

      # URI of the API we'll be searching.
      request_uri: ''

      # The basic geographical parameters we'll be tacking onto each request.
      # By default, we use a bounding box to constrain our results.
      request_geo_params:
        ne_lat: (map) -> map.getBounds().getNorthEast().lat
        ne_lng: (map) -> map.getBounds().getNorthEast().lng
        sw_lat: (map) -> map.getBounds().getSouthWest().lat
        sw_lng: (map) -> map.getBounds().getSouthWest().lng

      # JSON key for the results array.
      #
      # For example, if our API returns:
      #
      # {
      #    'businesses': [
      #       { name: "Tom's tasty tacos" },
      #       { name: "Adam's apple pies"}
      #    ]
      # }
      #
      # ...then our response_json_key should be 'businesses'.
      response_json_key: 'results'

      # Getter function for the lat/lng of each result.
      # By default, we assume that your object has both a 'latitude' and a 'longitude' property.
      response_params_latlng: (result) ->
        [result.latitude, result.longitude]

      # Getter functions for the pagination.
      # By default, we assume that the response has the following structure:
      #
      # {
      #    meta: {
      #        page: 1,
      #        per_page: 10,
      #        total_pages: 3
      #        count: 28
      #    }
      # }
      #
      response_params_pagination:
        page: (data) -> data.meta.page
        per_page: (data) -> data.meta.per_page
        total_pages: (data) -> data.meta.total_pages
        count: (data) -> data.meta.count

      # Element where we'll be inserting our results.
      results_el: $("#mapsearch-results")

      # A function that returns the HTML string for a single result.
      # You're definitely gonna need to customize this one.
      results_template: (key, result) ->
        "
        <div># #{key}: #{result['name']}</div>
        "

      # Element where we'll be inserting our pagination.
      pagination_el: $("#mapsearch-pagination")

      # A function that returns HTML for the pagination controls.
      pagination_template: (pagination) ->
        "
          Current Page: #{pagination.page}<br />
          Total Pages: #{pagination.total_pages}<br />
          Count: #{pagination.count}<br />
          Per Page: #{pagination.per_page}<br />
          <a href='#' data-mapsearch-role='change-page' data-mapsearch-pagenumber='#{pagination.page - 1}'>previous page</a><br />
          <a href='#' data-mapsearch-role='change-page' data-mapsearch-pagenumber='#{pagination.page + 1}'>next page</a>
        "

    # Extend our settings with the options passed in the intial mapSearch() call.
    settings = $.extend settings, options

    # The search parameters used in the last request.
    current_params = {}

    # The most recently returned pagination data.
    pagination_status = {}

    # An array to hold the markers on our map.
    markers = []

    # Initialize our map and add the tilelayer.
    map = L.map(this[0]).setView(settings.initial_coordinates, settings.initial_zoom)
    L.tileLayer(settings.tile_layer).addTo(map)

    # ====================================================
    # Make the call to your API
    # ----------------------------------------------------
    makeAjaxRequest = (new_params) ->
      request_params = new_params || current_params

      for key, func of settings.request_geo_params
        request_params[key] = func(map)

      current_params = request_params

      $.ajax
        url: settings.request_uri + "?" + $.param(request_params)
        type: 'GET'
        success: (data) ->
          if settings.response_json_key
            processResults(data[settings.response_json_key])
          else
            processResults(data)

          processPagination(data)

    # ====================================================
    # Process the returned json
    # ----------------------------------------------------
    processResults = (results) ->
      settings.results_el.html('')
      map.removeLayer(marker) for marker in markers

      $(results).each (key, result) ->
        key = key + 1
        new_marker = L.marker settings.response_params_latlng(result),
          icon: new L.NumberedDivIcon
            number: key
        markers.push new_marker.addTo(map)

        settings.results_el.append(settings.results_template(key, result))

    # ====================================================
    # Add pagination
    # ----------------------------------------------------
    processPagination = (data) ->
      settings.pagination_el.html('')

      page_params =
        page: settings.response_params_pagination.page(data)
        per_page: settings.response_params_pagination.per_page(data)
        total_pages: settings.response_params_pagination.total_pages(data)
        count: settings.response_params_pagination.count(data)

      settings.pagination_el.append(settings.pagination_template(page_params))
      pagination_status = page_params


    # ====================================================
    # Attach event handlers
    # ----------------------------------------------------
    map.on 'dragend zoomend', () ->
      exports.change_page(1); # also makes request

    $(document).on "click", "[data-mapsearch-role=change-page]", () -> exports.change_page($(this).data('mapsearch-pagenumber'));


    # ====================================================
    # Define additional functions
    # ----------------------------------------------------
    exports = {}

    exports.set_view = arguments.callee.set_view = (latlng, zoom, updateMap = true) ->
      map.setView(latlng, zoom)
      exports.update() if updateMap

    exports.update = arguments.callee.update = (new_params) =>
      makeAjaxRequest(new_params)

    exports.change_page = arguments.callee.change_page = (page) =>
      return if page > pagination_status.total_pages or page is 0
      makeAjaxRequest($.extend current_params, {page: page})
