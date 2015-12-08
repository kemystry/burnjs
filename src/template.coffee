class Burn.Template

  @caching: true

  @qCache: new Burn.Cache('templates-q', false)
  @tplCache: new Burn.Cache('templates', true)

  @baseUrl: ''

  templateUrl: ''
  templateString: ''

  constructor: (templateUrl) ->
    @templateUrl = templateUrl

  load: (cache) ->
    cache = true if _.isUndefined(cache)
    if cache && Burn.Template.qCache.get(@templateUrl)
      return Burn.Template.qCache.get(@templateUrl)
    else
      q = $.Deferred()
      Burn.Template.qCache.set(@templateUrl, q)
      if Burn.Template.tplCache.get(@templateUrl)
        q.resolve(Burn.Template.tplCache.get(@templateUrl))
      else
        $.get(@templateUrl).done((tpl) =>
          @templateString = tpl
          Burn.Template.tplCache.set(@templateUrl, @templateString)
          q.resolve(@templateString)
        ).fail(-> q.reject())
      q.promise()