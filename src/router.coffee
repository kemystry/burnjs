class Burn.Router extends Backbone.Router

  # @nodoc
  registerRoute: (path, name, controller) ->
    callback = ->
      if Burn.currentController instanceof controller
        ctrl = Burn.currentController
      else
        Burn.currentController.destroy() if Burn.currentController
        ctrl = Burn.currentController = new controller()
      # console.log('''TODO: Add layout attr to controllers,
      # only re-layout when needed''')
      params = {}
      if arguments.length > 0
        re = /:([a-zA-Z0-9_\-]+)/g
        for arg in arguments
          continue if _.isNull(arg)
          match = re.exec(path)
          if match and match[1]
            params[match[1]] = arg
          else
            params.query = _.chain(arg.split('&')).map((params) ->
              p = params.split('=')
              [p[0], decodeURIComponent(p[1])]
            ).object().value()
      ctrl.runBeforeFilters.apply(ctrl, [params, path, name]).done(->
        ctrl[name].apply(ctrl, [params])
        ctrl.currentRoutePath = path
        ctrl.currentRouteName = name
        ctrl.runAfterFilters.apply(ctrl, [params, path, name])
      ).fail((message) ->
        ctrl.onFilterFail(message, params, path, name)
      )
    @route(path, name, callback)
