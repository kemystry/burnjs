class Burn.View extends Backbone.View

  # Called before view has rendered. Override in your view.
  beforeRender: ->

  # Called after view has rendered. Override in your view.
  afterRender: ->

  # Called before view is destroyed. Override in your view.
  beforeDestroy: ->

  # Called after view is destroyed. Override in your view.
  afterDestroy: ->

  loadTemplate: ->
    q = $.Deferred()
    q

  render: ->
    @$el.addClass(@constructor.name)
    @beforeRender()
    @loadTemplate().then (tpl) =>
      @$el.html() if @template
      @__rivets__ = rivets.bind @el, @
      @afterRender()
    @

  destroy: ->
    @_beforeDestroy() if @_beforeDestroy
    @parent = null
    @__rivets__.unbind()
    delete @__rivets__
    @remove()
    @afterDestroy()