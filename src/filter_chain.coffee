class Burn.FilterChain

  filters: []

  # Creates FilterChain with provided `filters`
  # @param [Array] filters Array of callbacks to call in order
  constructor: (filters) ->
    @filters = filters

  # Starts chain
  # @return [jQuery.Promise]
  start: ->
    @q = $.Deferred()
    @_next()
    @q.promise()

  # @nodoc
  # @private
  _next: =>
    @_runFilter(@filters.shift())

  # @nodoc
  # @private
  _fail: (message) =>
    @q.reject(message)

  # @nodoc
  # @private
  _runFilter: (filter) =>
    if _.isUndefined(filter)
      @q.resolve()
    else
      filter.apply(@, [@_next, @_fail])
