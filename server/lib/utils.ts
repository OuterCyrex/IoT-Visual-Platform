export const createId = (prefix: string) => `${prefix}-${Math.random().toString(36).slice(2, 8)}`

export const nowText = () => {
  const now = new Date()
  const pad = (value: number) => String(value).padStart(2, '0')

  return [
    now.getFullYear(),
    pad(now.getMonth() + 1),
    pad(now.getDate()),
  ].join('-') + ` ${pad(now.getHours())}:${pad(now.getMinutes())}`
}

export const includesText = (value: string, keyword: string) =>
  value.toLowerCase().includes(keyword.toLowerCase())

export const pickQuery = (url: URL, key: string) => url.searchParams.get(key)?.trim() ?? ''
