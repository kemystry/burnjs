class TodoController extends Burn.Controller

  routes:
    ''      : 'index'
    'todos/:id'  : 'detail'

  beforeFilters:
  #   # 'beforeTest' : { only: ['detail'] }
    'setupLayout' : 'all'
    'setupCollection' : 'all'

  # afterFilters:
    # 'afterTest' : { except: ['detail'] }
    # 'allAfter' : 'all'

  setupLayout: (next, fail) =>
    @layout = new Burn.Layout('templates/layout.html')
    @layout.render().done((layout) ->
      next()
    ).fail(-> fail('layout failed'))

  setupCollection: (next, fail) =>
    @collection = new Burn.collections.TodoItemCollection()
    newTodo = @layout.newTodo
    newTodo.$el.on('keydown', (event) =>
      if event.keyCode == 13
        @collection.add({ title: newTodo.$el.val() }).save()
        newTodo.$el.val('')
    )
    @collection.fetch()
    next()

  allAfter: ->
    console.log('after all', arguments)

  # beforeTest: ->
  #   console.log('before', arguments)

  # afterTest: ->
  #   console.log('after', arguments)

  index: ->
    @view = new Burn.views.TodoItemIndexView(@collection)
    @layout.main.appendView(@view)

  detail: (params) ->
    # @listenTo(@view, 'todo:remove', @removeTodo)

    # .containers.content.update(view)

  removeTodo: ->
    @collectionRemove

  beforeDestroy: ->
    @layout.newTodo.$el.off('keydown')
    @layout.destroy()


Burn.registerController(TodoController)