export default function PageHeader({ eyebrow, title, description, action }) {
  return (
    <header className="px-8 pt-8 pb-6 border-b border-ink-700 flex items-start justify-between gap-4">
      <div>
        {eyebrow && <p className="label-eyebrow mb-2">{eyebrow}</p>}
        <h1 className="text-2xl font-bold">{title}</h1>
        {description && <p className="text-sm text-mist-300 mt-1.5 max-w-xl">{description}</p>}
      </div>
      {action}
    </header>
  )
}
