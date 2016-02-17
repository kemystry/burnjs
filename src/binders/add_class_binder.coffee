AddClassBinder = (el, value) ->
  unless $(el).hasClass(value)
    $(el).addClass(value)


Burn.registerBinder('add-class', AddClassBinder)
