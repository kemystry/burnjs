class TodoController extends Burn.Controller

  routes:
    'todos'      : 'index'
    'todos/:id'  : 'detail'

  beforeFilters:
    # 'beforeTest' : { only: ['detail'] }
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
    @collection = new TodoApp.TodoItemCollection()
    @layout.containers.input.$el.on('keydown', (event) =>
      if event.keyCode == 13
        @collection.add({ title: @layout.containers.input.$el.val() }).save()
        @layout.containers.input.$el.val('')
    )
    # @collection.fetch()
    next()

  allAfter: ->
    console.log('after all', arguments)

  # beforeTest: ->
  #   console.log('before', arguments)

  # afterTest: ->
  #   console.log('after', arguments)

  index: ->
    @view = new TodoApp.TodoItemIndexView(@collection)
    @layout.containers.main.appendView(@view)

  detail: (params) ->
    # @listenTo(@view, 'todo:remove', @removeTodo)

    # .containers.content.update(view)

  removeTodo: ->
    @collectionRemove


Burn.registerController(TodoController)