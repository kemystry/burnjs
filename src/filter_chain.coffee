class Burn.FilterChain

  filters: []

  constructor: (filters) ->
    @filters = filters

  next: =>
    @runFilter(@filters.shift())

  fail: (message) =>
    @q.fail(message)

  start: ->
    @q = $.Deferred()
    @next()
    @q.promise()

  runFilter: (filter) =>
    if _.isUndefined(filter)
      @q.resolve()
    else
      filter.apply(@, [@next, @fail])
