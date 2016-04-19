Burn.registerFormatter 'append', (target, val) ->
  if target then "#{target}#{val}" else target

Burn.registerFormatter 'prepend', (target, val) ->
  if target then "#{val}#{target}" else target

Burn.registerFormatter 'shorten', (target, val, ellipsis = false) ->
  if _.isUndefinedOrNull(target) or (target and target.length <= val)
    return target
  if ellipsis
    val = val - 3
  s = target.substring(0, val)
  if ellipsis
    s = "#{s}..."
  s

Burn.registerFormatter 'to-string', (target) ->
  if _.isUndefinedOrNull(target) then '' else target.toString()
