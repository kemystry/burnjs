class Burn

  @adapters: {}
  @controllers: {}
  @models: {}
  @views: {}
  @currentController: null
  @resourceHost: ''

  ###
  Registers a Burn.Controller and sets up the controller's routes
  @param [Burn.Controller] the controller to register
  ###
  @registerController: (controller) ->
    @router = @router || new Burn.Router()
    @controllers[controller.name] = controller
    for route, name of controller::routes
      routePath = "#{route}(/)"
      Burn.router.registerRoute(routePath, name, controller)

  ###
  Sets up and renders a Burn.Layout
  @return [Burn.Layout]
  @param [String|Burn.Layout] either template string or an instance of Burn.Layout
  ###
  @layout: (layout) ->
    if _.isString(layout)
      @currentLayout = new Burn.Layout()
      @currentLayout.template = layout
    else if layout instanceof Burn.Layout
      @currentLayout = layout
    @currentLayout.render()
    @currentLayout

  ###
  Start application and start listening to route changes
  ###
  @start: ->
    @_initConfig()
    @_initAdapters()
    Backbone.history.start()


  # @private
  # @nodoc
  @_initAdapters: ->
    rivets.adapters[':'] = Burn.adapters.BackboneRelational()

  # @private
  # @nodoc
  @_initConfig: ->
    config =
      prefix: 'brn'
      preloadData: true,
      rootInterface: '.',
      templateDelimiters: ['{', '}'],
      handler: (target, event, binding) ->
        if binding.model instanceof Burn.Model
          @call(binding.model)
        else
          @call target, event, binding.view.models
    rivets.configure(config)

self.Burn = Burn