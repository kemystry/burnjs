RhrefBinder =
  bind: (ele) ->
    $(ele).on('click', (event) ->
      event.preventDefault()
      Burn.router.navigate($(this).attr('rhref'), { trigger: true })
    )

  unbind: (ele) ->
    $(ele).off('click')

  routine: (ele, value) ->
    value = @keypath unless value
    $(ele).attr('rhref', value)
    $(ele).attr('href', value)

Burn.registerBinder('rhref', RhrefBinder)
