class TodoApp.TodoItem extends Burn.Model

  resourcePath: 'todos'

  defaults: ->
    title: ''
    completed: false