class Burn.Attachment

  el: null
  $el: null

  subviews: []

  constructor: (element) ->
    @el = element
    @$el = $(@el)


  appendView: (view) ->
    view.render()
    @$el.append(view.el)
    @subviews.push(view)

  prependView: (view) ->
    view.render()
    @$el.append(view.el)
    @subviews.push(view)

  removeView: (view) ->
    @subviews.splice(@subviews.indexOf(view), 1)
    view.destroy()

  destroy: ->
    for view in @subviews
      view.destroy()
    @$el.remove()