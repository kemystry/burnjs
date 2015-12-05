class Burn.Layout

  # @property [String] path to html template
  template: null

  # @nodoc
  containers: {}

  # Renders the layout and places it in the first element found
  # in the document with the `brn-app` attribute
  render: ->
    mainContainer = $('[brn-app]').first()
    mainContainer.text(@template)