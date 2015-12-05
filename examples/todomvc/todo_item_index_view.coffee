class TodoApp.TodoItemIndexView extends Burn.View
  template: 'templates/index.html'

  initialize: (collection) ->
    @todoItems = collection