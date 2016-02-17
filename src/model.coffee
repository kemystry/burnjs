class Burn.Model extends Backbone.RelationalModel

  # @attributes =
  #   name: 'string'
  #   cost: 'number'
  #   visible: 'boolean'
  #   createdAt: 'datetime'

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
    if _.isFunction(@resourcePath)
      path = @resourcePath()
    else
      path = @resourcePath
    id = @get('id')
    _url = "#{Burn.resourceHost}/#{path}"
    _url = "#{_url}/#{id}" if id
    _url + '/'

  # Helper method to apply a patch if values have changed
  # @param [Object] opts Options to pass
  update: (opts) ->
    opts = opts || {}
    if @changedAttributes()
      opts.patch = true
    @save(@changed, opts)

  toJSON: (opts) ->
    attributes = super(opts)
    if @excludeFromJSON
      attributes = _.omit(attributes, @excludeFromJSON)
    attributes
