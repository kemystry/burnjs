Burn.adapters.BackboneRelational =  ->

  factory = (action) ->
    (model, keypath, callback) ->
      unless model instanceof Burn.Model
        return
      value = model.get(keypath)
      eventName = if keypath == '*' then 'change' else "change:#{keypath}"
      model[action](eventName, callback)

      if value instanceof Burn.Collection
        value[action]('add remove reset sort', callback)

  getter = (obj, keypath) ->
    unless obj instanceof Burn.Model || obj instanceof Burn.Collection
      return

    value = if keypath == '*' then obj.attributes else obj.get(keypath)
    value.models if value instanceof Burn.Collection

  setter = (obj, keypath, value) ->
    unless obj instanceof Burn.Model || obj instanceof Burn.Collection
      return

    if keypath == '*'
      obj.set(value)
    else
      obj.set(keypath, value)

    {
      observe: factory('on'),
      unobserve: factory('off'),
      get: getter,
      set: setter
    }
