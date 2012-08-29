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
      pagination_data:
        page: (data) -> data.meta.page
        per_page: (data) -> data.meta.per_page
        total_pages: (data) -> data.meta.total_pages
        count: (data) -> data.meta.count

    settings = $.extend settings, options

    map = L.map(el[0]).setView(settings.initial_coordinates, settings.initial_zoom)
    L.tileLayer(settings.tile_layer).addTo(map)
    markers = []

    current_params = {}
    pagination_status = {}

    # ====================================================
    # Make the call to your API
    # ----------------------------------------------------
    makeAjaxRequest = (new_params) ->
      request_params = new_params || current_params

      for key, func of settings.geo_params
        request_params[key] = func(map)

      console.log settings.ajax.url + "?" + $.param(request_params)

      current_params = request_params

      $.ajax
        url: settings.ajax.url + "?" + $.param(request_params)
        type: settings.ajax.method
        success: (data) ->
          if settings.json_selector
            processResults(data[settings.json_selector])
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
        new_marker = L.marker settings.result_params.latlng(result),
          icon: new L.NumberedDivIcon
            number: key
        markers.push new_marker.addTo(map)

        settings.results_el.append(settings.results_template(key, result))


    processPagination = (data) ->
      settings.pagination_el.html('')

      page_params =
        page: settings.pagination_data.page(data)
        per_page: settings.pagination_data.per_page(data)
        total_pages: settings.pagination_data.total_pages(data)
        count: settings.pagination_data.count(data)

      settings.pagination_el.append(settings.pagination_template(page_params))
      pagination_status = page_params


    # ====================================================
    # Attach event handlers
    # ----------------------------------------------------
    map.on 'dragend zoomend', () ->
      change_page(1); # also makes request

    $(document).on "click", "[data-mapsearch-role=change-page]", () -> change_page($(this).data('mapsearch-pagenumber'));

    set_view = arguments.callee.set_view = (latlng, zoom, updateMap = true) ->
      map.setView(latlng, zoom)
      update() if updateMap

    update = arguments.callee.update = (new_params) =>
      makeAjaxRequest(new_params)

    change_page = arguments.callee.change_page = (page) =>
      return if page > pagination_status.total_pages or page is 0
      makeAjaxRequest($.extend current_params, {page: page})

    get_current_params = arguments.callee.get_current_params = () =>
      current_params
