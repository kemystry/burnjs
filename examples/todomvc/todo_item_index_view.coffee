class TodoItemIndexView extends Burn.View
  template: 'templates/index.html'

  initialize: (collection) ->
    @todoItems = collection

Burn.registerView(TodoItemIndexView)


class TodoItemView extends Burn.View
  template: 'templates/item.html'

  destroyTodo: =>
    @todo.destroy()

Burn.registerView(TodoItemView)