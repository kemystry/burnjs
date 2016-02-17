class Burn.Cache

  cache: {}
  persist: false
  namespace: ''

  # Creates new cache store, if persist is true, will use localStorage
  # @param [String] namespace Set namespace for key if using persistence
  # @param [Boolean] persist Set persistence
  constructor: (namespace, persist) ->
    @persist = persist || false
    @namespace = namespace || ''

  # Inserts val into cache identified by key
  # @param [String] key Key to identify cached val
  ###
  @param [String|Object] val Value to cache, if Persistence is on,
   Value must be a String
  ###
  set: (key, val) ->
    if @persist
      self.localStorage.setItem("#{@namespace}:#{key}", val)
    else
      @cache[key] = val

  # Retrieve value from cache identified by key
  # @param [String]
  # @return [String|Object]
  get: (key) ->
    if @persist
      self.localStorage.getItem("#{@namespace}:#{key}")
    else
      @cache[key]

  # Removes item from cache identified by key
  remove: (key) ->
    if @persist
      self.localStorage.removeItem("#{@namespace}:#{key}")
    else
      delete @cache[key]

  # Clear entire cache
  clear: ->
    if @persist
      for key, val of self.localStorage
        if key.indexOf("#{@namespace}:") == 0
          self.localStorage.removeItem(key)
    else
      @cache = []
