interface AnalyticsCardProps {
  title: string
  value: string | number
  description: string
}

export function AnalyticsCard({ title, value, description }: AnalyticsCardProps) {
  return (
    <div className="rounded-lg border bg-card p-6 shadow-sm">
      <div className="space-y-2">
        <h3 className="text-lg font-medium">{title}</h3>
        <div className="text-4xl font-bold">{value}</div>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  )
}

