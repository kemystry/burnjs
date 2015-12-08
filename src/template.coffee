###
@example Load a template
  var tpl = new Burn.Template('path/to/template.html')
  tpl.load().then(function (templateString) {
    alert(templateString);
  });
###
class Burn.Template

  @qCache: new Burn.Cache('templates-q', false)
  @tplCache: new Burn.Cache('templates', true)

  @baseUrl: ''

  templateUrl: ''
  templateString: ''

  # Creates a new template
  # @param [String] templateUrl path to template
  constructor: (templateUrl) ->
    @templateUrl = templateUrl

  # Loads the template
  # @param [Boolean] cache Retrieve from cache or not
  # @return [jQuery.Promise]
  load: (cache) ->
    cache = true if _.isUndefined(cache)
    if cache && Burn.Template.qCache.get(@templateUrl)
      return Burn.Template.qCache.get(@templateUrl)
    else
      q = $.Deferred()
      Burn.Template.qCache.set(@templateUrl, q)
      if cache && Burn.Template.tplCache.get(@templateUrl)
        q.resolve(Burn.Template.tplCache.get(@templateUrl))
      else
        $.get(@templateUrl).done((tpl) =>
          @templateString = tpl
          Burn.Template.tplCache.set(@templateUrl, @templateString)
          q.resolve(@templateString)
        ).fail(-> q.reject())
      q.promise()