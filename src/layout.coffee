class Burn.Layout

  # @property [String] path to html template
  template: null

  # @nodoc
  containers: {}

  constructor: (templateUrl) ->
    @template = templateUrl

  # Renders the layout and places it in the first element found
  # in the document with the `brn-app` attribute
  render: ->
    @appContainer = $('[brn-app]').first()
    q = $.Deferred()
    new Burn.Template(@template).load().then (tpl) =>
      @appContainer.html(tpl)
      @initContainers()
      q.resolve(@)
    q.promise()


  initContainers: ->
    @appContainer.find('[brn-container]').each (idx, ele) =>
      $ele = $(ele)
      name = $ele.attr('brn-container')
      @containers[name] = $ele
