EachBinder =
  block: true
  priority: 4000

  bind: (el) ->
    unless @marker?
      attr = [@view.prefix, @type].join('-').replace '--', '-'
      @marker = document.createComment " rivets: #{@type} "
      @iterated = []

      el.removeAttribute attr
      el.parentNode.insertBefore @marker, el
      el.parentNode.removeChild el
    else
      for view in @iterated
        view.bind()
    return

  unbind: (el) ->
    view.unbind() for view in @iterated if @iterated?
    return

  routine: (el, collection) ->
    modelName = @args[0]
    collection or= []
    if @iterated.length > collection.length
      index = 0
      while index < @iterated.length
        unless collection.indexOf(@iterated[index].models[modelName]) > -1
          view = @iterated.splice(index, 1)[0]
          view.unbind()
          $(view.els).remove()
        else
          index++
    else if @iterated.length < collection.length
      index = 0
      while index < collection.length
        model = collection[index]
        if @iterated[index] and @iterated[index].models[modelName] isnt model

          data = {index}
          data["%#{modelName}%"] = index
          data[modelName] ?= model
          template = el.cloneNode true
          options = @view.options()
          options.preloadData = true
          for key, model of @view.models
            data[key] = model
          view = rivets.bind(template, data, options)
          @iterated.splice(index, 0, view)
          nodes = $(@marker).parent().find('> ' + el.nodeName)
          nodes.eq(index).before(template)
        index++


    for model, index in collection
      data = {index}
      data["%#{modelName}%"] = index
      data[modelName] ?= model

      if not @iterated[index]?
        for key, model of @view.models
          data[key] = model

        previous = if @iterated.length
          @iterated[@iterated.length - 1].els[0]
        else
          @marker

        options = @view.options()
        options.preloadData = true
        template = el.cloneNode true

        view = rivets.bind(template, data, options)
        @iterated.push view

        @marker.parentNode.insertBefore template, previous.nextSibling
    if el.nodeName is 'OPTION'
      for binding in @view.bindings
        if binding.el is @marker.parentNode and binding.type is 'value'
          binding.sync()
    return

  update: (models) ->
    data = {}

    for key, model of models
      data[key] = model unless key is @args[0]

    view.update data for view in @iterated
    return

Burn.registerBinder('each-*', EachBinder)
