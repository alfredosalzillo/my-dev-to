export const readme = (strings, ...values) => strings
  .map((s, i) => [s, Array.isArray(values[i]) ? values[i].join('\n') : values[i]].join('')).join('');
