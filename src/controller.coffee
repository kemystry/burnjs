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
    @runFilters(name, @beforeFilters)

  # @nodoc
  runAfterFilters: (params, path, name) ->
    @runFilters(name, @afterFilters)

  # @nodoc
  runFilters: (name, filters) ->
    run = false
    for action, opts of filters
      if opts == 'all'
        run = true
      else if opts.only && opts.only.indexOf(name) != -1
        run = true
      else if opts.except && opts.except.indexOf(name) == -1
        run = true
      @[action].apply(@, [name]) if run
