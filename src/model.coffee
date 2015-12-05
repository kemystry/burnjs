class Burn.Model extends Backbone.RelationalModel

  # @nodoc
  url: ->
    unless @resourcePath
      throw new Error("#{@constructor.name} must specify a resourcePath")
    path = if _.isFunction(@resourcePath) then @resourcePath() else @resourcePath
    "#{Burn.resourceHost}/#{path}"