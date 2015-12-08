class Burn.Layout

  # @property [String] path to html template
  template: null

  # @nodoc
  attachments: {}

  # @nodoc
  el: null

  constructor: (templateUrl) ->
    @template = templateUrl

  # Renders the layout and places it in the first element found
  # in the document defined by selector
  # @param [String] selector to place layout
  # @return [jQuery.Promise]
  render: (selector) ->
    selector = selector || '[brn-app]'
    @el = $(selector).first()
    q = $.Deferred()
    new Burn.Template(@template).load().done((tpl) =>
      @el.html(tpl)
      @_initAttachments()
      q.resolve(@)
    ).fail(-> q.reject())
    q.promise()

  # Removes layout from DOM, and destroys all attached subviews
  destroy: ->
    for name, container of @attachments
      container.destroy()
      delete @attachments[name]
      delete @[name]
    @el.remove()

  # @nodoc
  # @private
  _initAttachments: ->
    @el.find('[brn-attach]').each (idx, ele) =>
      $ele = $(ele)
      name = $ele.attr('brn-attach')
      @attachments[name] = new Burn.Attachment(ele)
      @[name] = @attachments[name]