export default function Hero({ title, subtitle, ctaText, ctaHref }: { title: string; subtitle?: string; ctaText?: string; ctaHref?: string; }) {
  return (
    <div className="rounded-lg bg-gradient-to-r from-slate-800 to-slate-900 text-white p-10">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold">{title}</h1>
        {subtitle && <p className="mt-3 text-lg text-slate-200 max-w-2xl">{subtitle}</p>}
        {ctaText && (
          <div className="mt-6">
            <a href={ctaHref ?? '#'} className="inline-block rounded bg-white px-5 py-3 text-slate-900 font-medium">{ctaText}</a>
          </div>
        )}
      </div>
    </div>
  );
}
