BgImageBinder = (el, value) ->
  $(el).css('background-image', "url('#{value}')")


Burn.registerBinder('bg-img', BgImageBinder)
