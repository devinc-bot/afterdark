type EventFormSectionProps = {
  id: string
  title: string
  description: string
  children: React.ReactNode
}

export function EventFormSection({ id, title, description, children }: EventFormSectionProps) {
  const headingId = `${id}-title`

  return (
    <section
      aria-labelledby={headingId}
      className="grid gap-x-12 gap-y-4 lg:grid-cols-[minmax(0,16rem)_minmax(0,1fr)]"
    >
      <div className="flex flex-col gap-1 lg:sticky lg:top-8 lg:h-fit">
        <h2 id={headingId} className="font-heading text-sm font-semibold text-ink">
          {title}
        </h2>
        <p className="text-pretty text-sm text-ink-muted">{description}</p>
      </div>
      <div className="flex min-w-0 flex-col gap-5">{children}</div>
    </section>
  )
}
