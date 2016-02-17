class Burn.Attachment

  el: null
  $el: null

  subviews: []

  # @param [DOMElement] element
  constructor: (element) ->
    @subviews = []
    @el = element
    @$el = $(@el)

  # Renders and replaces content with `view`
  # @param [Burn.View] view
  setView: (view) ->
    @removeViews()
    view.render()
    @$el.html(view.el)
    @subviews.push(view)

  # Renders and appends `view` to the attachement's DOMElement
  # @param [Burn.View] view
  appendView: (view) ->
    view.render()
    @$el.append(view.el)
    @subviews.push(view)

  # Renders and prepends `view` to the attachement's DOMElement
  # @param [Burn.View] view
  prependView: (view) ->
    view.render()
    @$el.append(view.el)
    @subviews.push(view)

  # Destroys and removes `view` from attachment
  # @param [Burn.View] view
  removeView: (view) ->
    @subviews.splice(@subviews.indexOf(view), 1)
    view.destroy()

  # Destroys all subviews and removes attachment from the DOM
  destroy: ->
    @removeViews()
    @$el.remove()

  # Destroys all subviews
  removeViews: ->
    for view in @subviews
      @removeView(view)
