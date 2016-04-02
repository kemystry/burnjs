###
@example Load a template
  var tpl = new Burn.Template('path/to/template.html')
  tpl.load().then(function (templateString) {
    alert(templateString);
  });
###
class Burn.Template
  @revision: ''
  @caching: true

  @store: {}

  @baseUrl: ''

  templateUrl: ''
  templateString: ''

  # Creates a new template
  # @param [String] templateUrl path to template
  constructor: (templateUrl) ->
    @templateUrl = "#{templateUrl}?rev=#{Burn.Template.revision}"

  # Loads the template
  # @param [Boolean] cache Retrieve from cache or not
  # @return [jQuery.Promise]
  load: (cache) =>
    cache = Burn.Template.caching if _.isUndefined(cache)
    unless cache && Burn.Template.store[@templateUrl]
      q = $.Deferred()
      $.get(@templateUrl).done((tpl) =>
        @templateString = tpl
        q.resolve(@templateString)
      ).fail(-> q.reject())
      Burn.Template.store[@templateUrl] = q.promise()
    Burn.Template.store[@templateUrl]
