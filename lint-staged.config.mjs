/** @type {import('lint-staged').Config} */
export default {
  '*.{ts,tsx,js,jsx}': (files) => {
    const lintable = files.filter((file) => {
      const normalized = file.replace(/\\/g, '/')
      return (
        !normalized.includes('/.claude/') &&
        !normalized.includes('/.agents/') &&
        !normalized.endsWith('routeTree.gen.ts')
      )
    })

    if (lintable.length === 0) return []

    return [
      `oxlint --fix -c oxlint.json --no-error-on-unmatched-pattern ${lintable.join(' ')}`,
      `oxfmt -c .oxfmtrc.json ${lintable.join(' ')}`,
    ]
  },
}
