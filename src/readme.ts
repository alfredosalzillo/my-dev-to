export const readme = (strings: TemplateStringsArray, ...values: any) => strings
  .map((s, i) => [s, Array.isArray(values[i]) ? values[i].join('\n') : values[i]].join('')).join('');
