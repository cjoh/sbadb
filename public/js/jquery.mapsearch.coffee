$ = jQuery

$.fn.extend
  mapSearch: (options) ->
    el = this;

    settings =
      initial_coordinates: [40, -100]
      initial_zoom: 4
      tile_layer: 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'

      request_url: ''
      request_geo_params:
        ne_lat: (map) -> map.getBounds().getNorthEast().lat
        ne_lng: (map) -> map.getBounds().getNorthEast().lng
        sw_lat: (map) -> map.getBounds().getSouthWest().lat
        sw_lng: (map) -> map.getBounds().getSouthWest().lng

      response_json_selector: 'results'
      response_params_id: 'id'
      response_params_latlng: (result) ->
        [result.latitude, result.longitude]
      response_params_pagination:
        page: (data) -> data.meta.page
        per_page: (data) -> data.meta.per_page
        total_pages: (data) -> data.meta.total_pages
        count: (data) -> data.meta.count

      results_el: $("#mapsearch-results")
      results_template: (key, result) ->
        "
        <div># #{key}: #{result['name']}</div>
        "

      pagination_el: $("#mapsearch-pagination")
      pagination_template: (pagination) ->
        "
          Current Page: #{pagination.page}<br />
          Total Pages: #{pagination.total_pages}<br />
          Count: #{pagination.count}<br />
          Per Page: #{pagination.per_page}<br />
          <a href='#' data-mapsearch-role='change-page' data-mapsearch-pagenumber='#{pagination.page - 1}'>previous page</a><br />
          <a href='#' data-mapsearch-role='change-page' data-mapsearch-pagenumber='#{pagination.page + 1}'>next page</a>
        "

    settings = $.extend settings, options
    current_params = {}
    pagination_status = {}
    markers = []

    map = L.map(el[0]).setView(settings.initial_coordinates, settings.initial_zoom)
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
        url: settings.request_url + "?" + $.param(request_params)
        type: 'GET'
        success: (data) ->
          if settings.response_json_selector
            processResults(data[settings.response_json_selector])
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
