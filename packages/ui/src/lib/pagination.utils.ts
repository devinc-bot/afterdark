export type PaginationRangeItem = number | 'ellipsis'

export function getPaginationItems(currentPage: number, totalPages: number): PaginationRangeItem[] {
  if (totalPages <= 0) return []
  if (totalPages === 1) return [1]
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1)
  }

  const items: PaginationRangeItem[] = [1]

  if (currentPage > 3) {
    items.push('ellipsis')
  }

  const rangeStart = Math.max(2, currentPage - 1)
  const rangeEnd = Math.min(totalPages - 1, currentPage + 1)

  for (let page = rangeStart; page <= rangeEnd; page += 1) {
    items.push(page)
  }

  if (currentPage < totalPages - 2) {
    items.push('ellipsis')
  }

  items.push(totalPages)
  return items
}
