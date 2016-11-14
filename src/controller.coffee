###
@example Extend Burn.Controller and register the new controller
  class CustomController extends Burn.Controller

    routes:
      'alert/:title' : 'alert'

    alert: (params) ->
      alert(params.title)

  Burn.registerController(CustomController)
###
class Burn.Controller

  # @property [String]
  # Layout
  layout: null

  # @property [Object]
  # Object map of routes to their callbacks
  routes: {}

  # @property [Object]
  # Object map of methods to call before route execution
  beforeFilters: {}

  # @property [Object]
  # Object map of methods to call after route execution
  afterFilters: {}

  _events: []

  # Registers an event with the controller
  # @param [Object] Object that responds to 'on'
  # @param [Event] Event name
  # @param [Function] Callback
  listenTo: (obj, event, callback) ->
    @_events.push([obj, event, callback])
    obj.on(event, callback)

  # Unregisters all or some events with the controller
  # @param [Object] Object that responds to 'off'
  stopListening: (obj) ->
    if _.isUndefined(obj)
      for evt, idx in @_events
        evt[0].off(evt[1], evt[2])
      @_events = []
    else
      for evt, idx in @_events
        if evt?[0] == obj
          evt[0].off(evt[1], evt[2])
          @_events.splice(idx, 1)



  # @nodoc
  runBeforeFilters: (params, path, name) ->
    filters = @_buildFilterChain(name, @_getFilters('beforeFilters'))
    new Burn.FilterChain(filters, path, name).start()

  # @nodoc
  runAfterFilters: (params, path, name) ->
    filters = @_buildFilterChain(name, @_getFilters('afterFilters'))
    new Burn.FilterChain(filters, path, name).start()

  # Destroys controller and calls destroy hooks
  destroy: ->
    @beforeDestroy()
    @stopListening()
    @afterDestroy()

  # Called before controller is destroyed. Override in your controller.
  beforeDestroy: ->
  # Called after controller is destroyed. Override in your controller.
  afterDestroy: ->

  # Called when controller before or after filter fails
  onFilterFail: ->

  # @nodoc
  # @private
  _getFilters: (filterKey) ->
    filters = {}
    if @constructor.__super__ && @constructor.__super__[filterKey]
      filters = @constructor.__super__._getFilters(filterKey)
    _.extend(filters, @[filterKey])


  # @nodoc
  # @private
  _buildFilterChain: (name, filters) ->
    chain = []
    # Change this to an Array
    # console.log("""
    # TODO: Change from object to Array to make sure they run in order
    # """)
    for action, opts of filters
      run = false
      if opts == 'all'
        run = true
      else if opts.only && opts.only.indexOf(name) != -1
        run = true
      else if opts.except && opts.except.indexOf(name) == -1
        run = true
      chain.push(@[action]) if run
    chain
