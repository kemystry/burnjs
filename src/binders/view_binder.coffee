ViewBinder =
  block: false
  priority: 9000

  bind: (el) ->
    parseAttr = (model, keypath) ->
      v = rivets._.sightglass model, keypath, null,
        root: rivets.rootInterface
        adapters: rivets.adapters
      rivets.adapters[':'].get(v.target, v.key.path)

    props = {}
    el.removeAttribute('brn-view')
    for attr in el.attributes
      if attr.value.indexOf(':') > -1 and attr.value.indexOf('!') isnt 0
        model = parseAttr(@view.models, attr.value)
      else unless attr.name is 'view'
        model = @view.models[attr.value] unless attr.name.indexOf('brn-') > -1
      if model
        props[S(attr.name).camelize().s] = model
      else
        if attr.value.indexOf('!') is 0
          val = attr.value.substr(1)
        else
          val = attr.value
        props[S(attr.name).camelize().s] = val
    view = $(el).attr('view')
    @_view = new Burn.views[view]({ el: el, properties: props })
    @_view.render()

  unbind: (el) ->
    @_view.destroy()

  routine: (el) ->
    return

Burn.registerBinder('view', ViewBinder)
