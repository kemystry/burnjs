BgImageBinder = (el, value = '') ->
  value = value.replace("'", "%27")
  $(el).css('background-image', "url('#{value}')")


Burn.registerBinder('bg-img', BgImageBinder)
