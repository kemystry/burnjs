class Burn.Layout

  # @property [String] path to html template
  template: null

  # @nodoc
  attachments: {}

  # @nodoc
  el: null

  # @nodoc
  $el: null

  # Override
  initialize: (opts) ->

  # Creates a new layout
  # @param [String] templateUrl path to layout template
  constructor: (opts) ->
    opts = opts || {}
    @template = new Burn.Template(opts.template) if opts.template
    el = opts.el || '<div></div>'
    @$el = $(el)
    @el = @$el[0]
    @initialize(opts)

  # Renders the layout and places it in the first element found
  # in the document defined by selector
  # @param [String] selector to place layout
  # @return [jQuery.Promise]
  render:  ->
    q = $.Deferred()
    @template.load().done((tpl) =>
      @$el.html(tpl)
      @_initAttachments()
      @_binding = rivets.bind @el, {}
      q.resolve(@)
    ).fail(-> q.reject())
    q.promise()

  # Removes layout from DOM, and destroys all attached subviews
  destroy: ->
    @_binding.unbind()
    delete @_binding
    for name, container of @attachments
      container.destroy()
      delete @attachments[name]
      delete @[name]
    @el.remove()

  # @nodoc
  # @private
  _initAttachments: ->
    @$el.find('[brn-attach]').each (idx, ele) =>
      $ele = $(ele)
      name = $ele.attr('brn-attach')
      @attachments[name] = new Burn.Attachment(ele)
      @[name] = @attachments[name]
