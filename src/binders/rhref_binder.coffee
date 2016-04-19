RhrefBinder =
  bind: (ele) ->
    $(ele).on('click', (event) ->
      if event.target is event.currentTarget
        event.preventDefault()
        Burn.router.navigate($(this).attr('rhref'), { trigger: true })
    )

  unbind: (ele) ->
    $(ele).off('click')

  routine: (ele, value) ->
    value = @keypath unless value
    $(ele).attr('rhref', value.replace(/^\//, ''))
    $(ele).attr('href', '#' + value.replace(/^\//, ''))

Burn.registerBinder('rhref', RhrefBinder)
