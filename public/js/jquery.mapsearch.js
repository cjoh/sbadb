// Generated by CoffeeScript 1.3.3
(function() {
  var $;

  $ = jQuery;

  $.fn.extend({
    mapSearch: function(options) {
      var change_page, current_params, el, get_current_params, makeAjaxRequest, map, markers, pagination_status, processPagination, processResults, set_view, settings, update,
        _this = this;
      el = this;
      settings = {
        initial_coordinates: [40, -100],
        initial_zoom: 4,
        tile_layer: 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        geo_params: {
          ne_lat: function(map) {
            return map.getBounds().getNorthEast().lat;
          },
          ne_lng: function(map) {
            return map.getBounds().getNorthEast().lng;
          },
          sw_lat: function(map) {
            return map.getBounds().getSouthWest().lat;
          },
          sw_lng: function(map) {
            return map.getBounds().getSouthWest().lng;
          }
        },
        json_selector: '',
        result_params: {
          id: 'id',
          latlng: function(result) {
            return [result.latitude, result.longitude];
          }
        },
        ajax: {
          url: '',
          type: 'GET'
        },
        results_el: $("#mapsearch-results"),
        results_template: function(result) {
          return "        <div>" + result[settings.result_params.id] + "</div>        ";
        },
        pagination_el: $("#mapsearch-pagination"),
        pagination_template: function(pagination) {
          return "          Current Page: " + pagination.page + "<br />          Total Pages: " + pagination.total_pages + "<br />          Count: " + pagination.count + "<br />          Per Page: " + pagination.per_page + "<br />          <a href='#' data-mapsearch-role='change-page' data-mapsearch-pagenumber='" + (pagination.page - 1) + "'>previous page</a><br />          <a href='#' data-mapsearch-role='change-page' data-mapsearch-pagenumber='" + (pagination.page + 1) + "'>next page</a>        ";
        },
        pagination_data: {
          page: function(data) {
            return data.meta.page;
          },
          per_page: function(data) {
            return data.meta.per_page;
          },
          total_pages: function(data) {
            return data.meta.total_pages;
          },
          count: function(data) {
            return data.meta.count;
          }
        }
      };
      settings = $.extend(settings, options);
      map = L.map(el[0]).setView(settings.initial_coordinates, settings.initial_zoom);
      L.tileLayer(settings.tile_layer).addTo(map);
      markers = [];
      current_params = {};
      pagination_status = {};
      makeAjaxRequest = function(new_params) {
        var func, key, request_params, _ref;
        request_params = new_params || current_params;
        _ref = settings.geo_params;
        for (key in _ref) {
          func = _ref[key];
          request_params[key] = func(map);
        }
        console.log(settings.ajax.url + "?" + $.param(request_params));
        current_params = request_params;
        return $.ajax({
          url: settings.ajax.url + "?" + $.param(request_params),
          type: settings.ajax.method,
          success: function(data) {
            if (settings.json_selector) {
              processResults(data[settings.json_selector]);
            } else {
              processResults(data);
            }
            return processPagination(data);
          }
        });
      };
      processResults = function(results) {
        var marker, result, _i, _j, _len, _len1, _results;
        settings.results_el.html('');
        for (_i = 0, _len = markers.length; _i < _len; _i++) {
          marker = markers[_i];
          map.removeLayer(marker);
        }
        $(results).each(function(key, result) {
          return markers.push(L.marker(settings.result_params.latlng(result)).addTo(map));
        });
        _results = [];
        for (_j = 0, _len1 = results.length; _j < _len1; _j++) {
          result = results[_j];
          _results.push(settings.results_el.append(settings.results_template(result)));
        }
        return _results;
      };
      processPagination = function(data) {
        var page_params;
        settings.pagination_el.html('');
        page_params = {
          page: settings.pagination_data.page(data),
          per_page: settings.pagination_data.per_page(data),
          total_pages: settings.pagination_data.total_pages(data),
          count: settings.pagination_data.count(data)
        };
        settings.pagination_el.append(settings.pagination_template(page_params));
        return pagination_status = page_params;
      };
      map.on('dragend zoomend', function() {
        return change_page(1);
      });
      $(document).on("click", "[data-mapsearch-role=change-page]", function() {
        return change_page($(this).data('mapsearch-pagenumber'));
      });
      set_view = arguments.callee.set_view = function(latlng, zoom, updateMap) {
        if (updateMap == null) {
          updateMap = true;
        }
        map.setView(latlng, zoom);
        if (updateMap) {
          return update();
        }
      };
      update = arguments.callee.update = function(new_params) {
        return makeAjaxRequest(new_params);
      };
      change_page = arguments.callee.change_page = function(page) {
        if (page > pagination_status.total_pages || page === 0) {
          return;
        }
        return makeAjaxRequest($.extend(current_params, {
          page: page
        }));
      };
      return get_current_params = arguments.callee.get_current_params = function() {
        return current_params;
      };
    }
  });

}).call(this);
