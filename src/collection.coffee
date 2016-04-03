class Burn.Collection extends Backbone.Collection

  updating: false

  # @nodoc
  constructor: ->
    @on('request', (collection) ->
      return unless collection is this
      @updating = true
    )
    @on('sync', (collection) ->
      return unless collection is this
      @updating = false
    )
    @on('error', (collection) ->
      return unless collection is this
      @updating = false
    )
    super

  # @nodoc
  url: ->
    unless @resourcePath
      throw new Error("#{@constructor.name} must specify a resourcePath")
    if _.isFunction(@resourcePath)
      path = @resourcePath()
    else
      path = @resourcePath
    "#{Burn.resourceHost}/#{path}/"
