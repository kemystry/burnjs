class Burn.Collection extends Backbone.Collection

  updating: false

  # @nodoc
  constructor: ->
    @on('request', ->
      @updating = true
    )
    @on('sync', ->
      @updating = false
    )
    @on('error', ->
      @updating = false
    )
    super

  # @nodoc
  url: ->
    unless @resourcePath
      throw new Error("#{@constructor.name} must specify a resourcePath")
    path = if _.isFunction(@resourcePath) then @resourcePath() else @resourcePath
    "#{Burn.resourceHost}/#{path}"