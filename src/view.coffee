class Burn.View extends Backbone.View

  # @nodoc
  # @private
  _binding: null

  # Called before view has rendered. Override in your view.
  beforeRender: ->

  # Called after view has rendered. Override in your view.
  afterRender: ->

  # Called before view is destroyed. Override in your view.
  beforeDestroy: ->

  # Called after view is destroyed. Override in your view.
  afterDestroy: ->

  # @nodoc
  constructor: (opts) ->
    @options = opts
    if _.isObject(opts) && opts.properties
      for key, val of opts.properties
        @[key] = val
    super
    @el.view = @

  # Renders the template and activates all bindings
  # @return [DOMElement] The rendered element
  render: ->
    @beforeRender()
    if @template
      new Burn.Template(@template).load().then (tpl) =>
        @$el.html(tpl)
        @$el.addClass(@constructor.name)
        @_binding = rivets.bind @el, @
        @afterRender()
    @el

  # Destroys view and removes from DOM
  destroy: ->
    @beforeDestroy()
    @parent = null
    if @_binding
      @_binding.unbind()
      delete @_binding
    @remove()
    @afterDestroy()

  navigate: (route, trigger) ->
    opts = { trigger: true } unless trigger == false
    Burn.router.navigate(route, opts)
