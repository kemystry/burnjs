class Burn
  @version: '{VERSION}'

  @adapters: {}
  @controllers: {}
  @models: {}
  @collections: {}
  @views: {}
  @currentController: null
  @resourceHost: ''
  @resourceAttrTransform: null

  ###
  Registers a Burn.Controller and sets up the controller's routes
  @param [Burn.Controller] the controller to register
  ###
  @registerController: (name, controller) ->
    @router or= new Burn.Router()
    controller.name = name
    @controllers[name] = controller
    for route, funcName of controller::routes
      if controller::scope
        routePath = "#{controller::scope}/#{route}(/)"
      else
        routePath = "#{route}(/)"
        routePath = route if route is '*path'
      Burn.router.registerRoute(routePath, funcName, controller)

  # Registers a `Burn.View` with Burn
  # @param [Burn.View] view
  @registerView: (name, view) ->
    view.name = name
    @views[name] = view

  # Registers a `Burn.Model` with Burn
  # @param [Burn.Model] model
  @registerModel: (name, model) ->
    model.name = name
    @models[name] = model

  # Registers a `Burn.Collection` with Burn
  # @param [Burn.Collection] collection
  @registerCollection: (name, collection) ->
    collection.name = name
    @collections[name] = collection

  # Registers a binder with Burn
  # @param [String] name
  # @param [Object] binder
  @registerBinder: (name, binder) ->
    rivets.binders[name] = binder

  # Registers a filter with Burn
  # @param [String] name
  # @param [Object] filter
  @registerFormatter: (name, formatter) ->
    rivets.formatters[name] = formatter

  # Registers a component with Burn
  # @param [String] name
  # @param [Object] component
  @registerComponent: (name, component) ->
    rivets.components[name] = component

  ###
  Sets up and renders a Burn.Layout
  @return [Burn.Layout]
  @param [String|Burn.Layout] either template string or an instance of
   Burn.Layout
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
  @start: (opts) ->
    @_initOpts(opts)
    @_initConfig()
    @_initAdapters()
    Backbone.history.start(_.pick(opts, 'hashChange', 'pushState', 'root'))

  # @private
  # @nodoc
  @_initOpts: (opts) ->
    @opts = opts || {}
    @resourceHost = @opts.resourceHost || ''
    @resourceAttrTransform = @opts.resourceAttrTransform || null

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
