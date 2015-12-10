class TodoItemIndexView extends Burn.View
  template: 'templates/index.html'

  initialize: (collection) ->
    @todoItems = collection

Burn.registerView(TodoItemIndexView)


class TodoItemView extends Burn.View
  template: 'templates/item.html'

  events:
    'dblclick label': 'editTitle'

  editTitle: (event) ->
    $todo = $(event.currentTarget).closest('.todo')
    $todo.addClass('editing')
    $todo.one('blur', 'input.title', =>
      @todo.update().then -> $todo.removeClass('editing')
    )
    $todo.on('keydown', (event) =>
      if event.keyCode == 13
        $todo.find('input.title').blur()
        $todo.off('keydown')
    )
    $todo.find('input.title').focus().select()

  destroyTodo: =>
    @todo.destroy({ wait: true })

Burn.registerView(TodoItemView)