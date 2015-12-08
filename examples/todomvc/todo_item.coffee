class TodoItem extends Burn.Model

  resourcePath: 'todos'

  defaults: ->
    title: ''
    completed: false

Burn.registerModel(TodoItem)