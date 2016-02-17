# @nodoc
IncludeComponent =
  static: ['view', 'tag']
  template: -> ''

  initialize: (el, data) ->
    delete data.view
    opts = { properties: data }
    if @static.tag
      $el = $(el)
      newEl = $("<#{@static.tag}/>")
      $el.replaceWith(newEl)
      el = newEl[0]
      opts.el = el
    @_view = new Burn.views[@static.view](opts)
    $(el).html(@_view.render())
    @_view


Burn.registerComponent('include', IncludeComponent)
