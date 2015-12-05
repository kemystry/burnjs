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
    $.get(@template)

  render: ->
    @$el.addClass(@constructor.name)
    @beforeRender()
    @loadTemplate().then (tpl) =>
      @$el.html(tpl)
      @__rivets__ = rivets.bind @el, @
      @afterRender()
    @el

  destroy: ->
    @_beforeDestroy() if @_beforeDestroy
    @parent = null
    @__rivets__.unbind()
    delete @__rivets__
    @remove()
    @afterDestroy()