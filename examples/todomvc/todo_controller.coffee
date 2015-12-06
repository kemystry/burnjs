class TodoController extends Burn.Controller

  routes:
    'todos'      : 'index'
    'todos/:id'  : 'detail'

  beforeFilters:
    # 'beforeTest' : { only: ['detail'] }
    'allBefore' : 'all'

  # afterFilters:
    # 'afterTest' : { except: ['detail'] }
    # 'allAfter' : 'all'

  allBefore: (next, fail) =>
    @layout = new Burn.Layout('templates/layout.html')
    @layout.render().then (layout) ->
      next()

  allAfter: ->
    console.log('after all', arguments)

  beforeTest: ->
    console.log('before', arguments)

  afterTest: ->
    console.log('after', arguments)

  index: ->
    @collection = new TodoApp.TodoItemCollection()
    @collection.fetch()
    @view = new TodoApp.TodoItemIndexView(@collection)
    @layout.containers.main.html(@view.render())

  detail: (params) ->
    # @listenTo(@view, 'todo:remove', @removeTodo)

    # .containers.content.update(view)

  removeTodo: ->
    @collectionRemove


Burn.registerController(TodoController)