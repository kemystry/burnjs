class Burn.Template

  @baseUrl: ''

  templateUrl: ''
  templateString: ''

  constructor: (templateUrl) ->
    @templateUrl = templateUrl

  load: ->
    q = $.Deferred()
    $.get(@templateUrl).done((tpl) =>
      @templateString = tpl
      q.resolve(@templateString)
    ).fail(-> q.reject())
    q.promise()