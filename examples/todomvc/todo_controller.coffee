class TodoController extends Burn.Controller

  routes:
    ''          : 'test'
    'todo/:id'  : 'detail'

  beforeFilters:
    'beforeTest' : { only: ['detail'] }
    'allBefore' : 'all'

  afterFilters:
    'afterTest' : { except: ['detail'] }
    'allAfter' : 'all'

  allBefore: ->
    @collection = new TodoApp.TodoItemCollection()
    console.log('before all', arguments)

  allAfter: ->
    console.log('after all', arguments)

  beforeTest: ->
    console.log('before', arguments)

  afterTest: ->
    console.log('after', arguments)

  test: ->
    console.log('test')

  detail: (params) ->
    @collection.fetch()
    # @view = new TodoApp.TodoItemIndexView(@collection)
    # @listenTo(@view, 'todo:remove', @removeTodo)
    Burn.layout('default')
    # .containers.content.update(view)

  removeTodo: ->
    @collectionRemove


Burn.registerController(TodoController)