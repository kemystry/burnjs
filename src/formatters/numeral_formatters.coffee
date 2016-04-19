Burn.registerFormatter 'numeral', (target, val) ->
  if _.isNaN(parseFloat(target))
    target
  else
    numeral(target).format(val)

Burn.registerFormatter 'currency', (target, val) ->
  rivets.formatters.numeral(target, '$0,0.00')

Burn.registerFormatter 'formatNumber', (target, val) ->
  rivets.formatters.numeral(target, '0,0.00')
