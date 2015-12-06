class Burn.Template

  @baseUrl: ''

  templateUrl: ''
  templateString: ''

  constructor: (templateUrl) ->
    @templateUrl = templateUrl

  load: ->
    q = $.Deferred()
    $.get(@templateUrl).then((tpl) =>
      @templateString = tpl
      q.resolve(@templateString)
    )
    q.promise()