import { useId } from 'react'

export function SettingsSection({ title, children }: { title: string; children: React.ReactNode }) {
  const headingId = useId()

  return (
    <section
      aria-labelledby={headingId}
      className="flex flex-col gap-4 border-t border-hairline/60 pt-8 first:border-0 first:pt-0 sm:gap-5"
    >
      <h2 id={headingId} className="font-heading text-base font-medium text-ink sm:text-lg">
        {title}
      </h2>
      {children}
    </section>
  )
}
