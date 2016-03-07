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

  # @nodoc
  runBeforeFilters: (params, path, name) ->
    filters = @_buildFilterChain(name, @beforeFilters)
    new Burn.FilterChain(filters).start()

  # @nodoc
  runAfterFilters: (params, path, name) ->
    filters = @_buildFilterChain(name, @afterFilters)
    new Burn.FilterChain(filters).start()

  # Destroys controller and calls destroy hooks
  destroy: ->
    @beforeDestroy()
    @afterDestroy()

  # Called before controller is destroyed. Override in your controller.
  beforeDestroy: ->
  # Called after controller is destroyed. Override in your controller.
  afterDestroy: ->

  # @nodoc
  # @private
  _buildFilterChain: (name, filters) ->
    chain = []
    # Change this to an Array
    console.log("""
    TODO: Change from object to Array to make sure they run in order
    """)
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
