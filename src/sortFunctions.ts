export const numericSort = (key: string) => (a: any, b: any) => a[key] - b[key]

export const localeSort = (key: string) => (a: any, b: any) =>
  a[key].localeCompare(b[key])
