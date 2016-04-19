Burn.registerFormatter 'formatDate', (target, val) ->
  shortcuts =
    'long': 'MMM Do, YYYY'
    'short': 'MM/DD/YY'
    'datetime-long': 'MMM Do, YYYY @ h:mm a'
    'datetime-short': 'MM/DD/YYYY @ h:mm a'

  val = shortcuts[val] if shortcuts[val]
  if target then moment(target).format(val) else target
