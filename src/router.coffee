class Burn.Router extends Backbone.Router

  # @nodoc
  registerRoute: (path, name, controller) ->
    callback = ->
      ctrl = Burn.currentController = new controller()
      params = {}
      if arguments.length > 0
        re = /:([a-zA-Z0-9_\-]+)/g
        for arg in arguments
          continue if _.isNull(arg)
          match = re.exec(path)
          params[match[1]] = arg
      ctrl.runBeforeFilters.apply(ctrl, [params, path, name]).done(->
        ctrl[name].apply(ctrl, [params])
        ctrl.runAfterFilters.apply(ctrl, [params, path, name])
      ).fail((message) ->
        alert(message)
      )
    @route(path, name, callback)