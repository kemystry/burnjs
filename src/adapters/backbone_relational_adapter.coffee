# @nodoc
Burn.adapters.BackboneRelational =  ->

  _factory = (action) ->
    (model, keypath, callback) ->
      if model instanceof Backbone.RelationalModel
        value = model.get(keypath)
        eventName = if keypath == '*' then 'change' else "change:#{keypath}"
        model[action](eventName, callback)
        if value instanceof Backbone.Collection
          value[action]('add remove reset sort change', callback)
      else if model instanceof Backbone.Collection && keypath == 'models'
        model[action]('add remove reset sort change', callback)

  _getter = (obj, keypath) ->
    if obj instanceof Backbone.RelationalModel
      value = if keypath == '*' then obj.attributes else obj.get(keypath)
      value = value.models if value instanceof Backbone.Collection
    else if obj instanceof Backbone.Collection
      value = obj.models
    value

  _setter = (obj, keypath, value) ->
    unless obj instanceof Backbone.RelationalModel ||
    obj instanceof Backbone.Collection
      return

    if keypath == '*'
      obj.set(value)
    else
      obj.set(keypath, value)

  {
    observe: _factory('on'),
    unobserve: _factory('off'),
    get: _getter,
    set: _setter
  }
