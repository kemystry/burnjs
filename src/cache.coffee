class Burn.Cache

  cache: {}
  persist: false
  namespace: ''

  constructor: (namespace, persist) ->
    @persist = persist || false
    @namespace = namespace || ''

  set: (key, val) ->
    if @persist
      self.localStorage.setItem("#{@namespace}:#{key}", val)
    else
      @cache[key] = val

  get: (key) ->
    if @persist
      self.localStorage.getItem("#{@namespace}:#{key}")
    else
      @cache[key]

  remove: (key) ->
    if @persist
      self.localStorage.removeItem("#{@namespace}:#{key}")
    else
      delete @cache[key]

  clear: ->
    if @persist
      for key, val of self.localStorage
        if key.indexOf("#{@namespace}:") == 0
          self.localStorage.removeItem(key)
    else
      @cache = []