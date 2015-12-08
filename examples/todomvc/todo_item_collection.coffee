class TodoItemCollection extends Burn.Collection

  model: Burn.models.TodoItem

  resourcePath: 'todos'

Burn.registerCollection(TodoItemCollection)