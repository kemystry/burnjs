IncludeComponent =
  static: ['view']
  template: -> ''

  initialize: (el, data) ->
    delete data.view
    @_view = new Burn.views[@static.view]({ properties: data })
    $(el).html(@_view.render())
    @_view


Burn.registerComponent('include', IncludeComponent)