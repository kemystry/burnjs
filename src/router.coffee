class Burn.Router extends Backbone.Router

  # @nodoc
  registerRoute: (path, name, controller) ->
    callback = ->
      if Burn.currentController instanceof controller
        ctrl = Burn.currentController
      else
        Burn.currentController.destroy() if Burn.currentController
        ctrl = Burn.currentController = new controller()
      console.log('''TODO: Add layout attr to controllers,
      only re-layout when needed''')
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
