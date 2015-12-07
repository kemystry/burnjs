class Burn.Container

  el: null
  $el: null

  subviews: []

  constructor: (element) ->
    @el = element
    @$el = $(@el)


  appendView: (view) ->
    view.render()
    @$el.html(view.el)
    @subviews.push(view)

  destroy: ->
    for view in @subviews
      view.destroy()
    @$el.remove()