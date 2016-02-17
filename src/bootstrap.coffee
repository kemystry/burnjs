# self._syncCache = new Burn.Cache('sync-cache', true)
# _sync = Backbone.sync
#
# Backbone.sync = (method, model, opts) ->
#   q = $.Deferred()
#   fromCache = (opts && opts.cache)
#   cached = self._syncCache.get(opts.cache) if fromCache
#   if fromCache && cached
#     _args = JSON.parse(cached)
#     model.trigger('request', model, _args[2])
#     q.resolveWith(model, _args)
#   else
#     s = _sync(method, model, opts)
#     s.done (method, model, _opts) ->
#       argArray = [method, model, _opts]
#       if fromCache
#         self._syncCache.set(opts.cache, JSON.stringify(argArray))
#       q.resolveWith(model, argArray)
#     s.fail (method, model, _opts) ->
#       q.rejectWith(model, [method, model, _opts])
#   q.promise()
