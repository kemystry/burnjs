class Burn.Model extends Backbone.RelationalModel

  fetching: false
  destroying: false
  updating: false
  saving: false

  # @nodoc
  constructor: ->
    @validations = new Backbone.Model()
    @on('request', ->
      @updating = true
    )
    @on('sync', ->
      @updating = false
    )
    @on('error', ->
      @updating = false
    )
    @on('change', (model, options) ->
      model.validate(key) for key in _.keys(model.changed)
    )
    @on('validated:invalid', (model, errors) =>
      @validations.clear()
      @validations.set(errors)
    )
    @on('validated:valid', (model, errors) =>
      @validations.clear()
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
    @save(_.pick(@toJSON(), _.keys(@changed)), opts)

  toJSON: (opts) ->
    attributes = super(opts)
    if @excludeFromJSON
      attributes = _.omit(attributes, @excludeFromJSON)
    attributes

  validateField: (field) =>
    val = @preValidate(field, @get(field))
    if val
      @validations.set(field, val)
    else
      @validations.unset(field)

  fetch: =>
    @fetching = true
    if @_xhr
      @_xhr.abort() if @_xhr.readyState isnt 4
      @_xhr = null
    @_xhr = super
    @_xhr.done =>
      @fetching = false
    @_xhr.fail =>
      @fetching = false
    @_xhr

  save: =>
    @_xhr = super
    return @_xhr unless @_xhr
    @saving = true
    @_xhr.done =>
      @saving = false
    @_xhr.fail =>
      @saving = false
    @_xhr

  destroy: =>
    @_xhr = super
    return @_xhr unless @_xhr
    @destroying = true
    @_xhr.done =>
      @destroying = false
    @_xhr.fail =>
      @destroying = false
    @_xhr

_.extend(Burn.Model.prototype, Backbone.Validation.mixin)
