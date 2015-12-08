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
    if opts.properties
      for key, val of opts.properties
        @[key] = val
    super

  # Renders the template and activates all bindings
  # @return [DOMElement] The rendered element
  render: ->
    @$el.addClass(@constructor.name)
    @beforeRender()
    new Burn.Template(@template).load().then (tpl) =>
      @$el.html(tpl)
      @_binding = rivets.bind @el, @
      @afterRender()
    @el

  # Destroys view and removes from DOM
  destroy: ->
    @_beforeDestroy()
    @parent = null
    @_binding.unbind()
    delete @_binding
    @remove()
    @afterDestroy()