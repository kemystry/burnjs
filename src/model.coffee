class Burn.Model extends Backbone.RelationalModel

  updating: false

  # @nodoc
  url: ->
    unless @resourcePath
      throw new Error("#{@constructor.name} must specify a resourcePath")
    path = if _.isFunction(@resourcePath) then @resourcePath() else @resourcePath
    id = @get('id')
    _url = "#{Burn.resourceHost}/#{path}"
    _url = "#{_url}/#{id}" if id
    _url

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

  # Helper method to apply a patch
  # @param [Object] opts Options to pass
  update: (opts) ->
    opts = opts || {}
    opts.patch = true
    changed = @changedAttributes()
    if changed
      @save(changed, opts)
    else
      q = $.Deferred()
      q.resolve(false)
      q