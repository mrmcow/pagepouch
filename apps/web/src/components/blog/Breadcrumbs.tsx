import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

interface BreadcrumbItem {
  name: string
  url: string
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[]
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className="mb-6">
      <ol className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 min-w-0">
        {items.map((item, index) => {
          const isLast = index === items.length - 1
          return (
            <li
              key={item.url}
              className={`flex items-center gap-1.5 min-w-0 ${
                // Hide the article title breadcrumb on mobile — it wraps badly and
                // the h1 just below communicates the same information.
                isLast && index > 1 ? 'hidden sm:flex' : 'flex'
              }`}
            >
              {index > 0 && (
                <ChevronRight className="h-3.5 w-3.5 flex-shrink-0 text-slate-300 dark:text-slate-600" aria-hidden="true" />
              )}
              {isLast ? (
                <span
                  className="font-medium text-slate-700 dark:text-slate-200 truncate max-w-[200px] sm:max-w-none"
                  aria-current="page"
                >
                  {item.name}
                </span>
              ) : (
                <Link
                  href={item.url}
                  className="hover:text-slate-700 dark:hover:text-slate-200 transition-colors whitespace-nowrap"
                >
                  {item.name}
                </Link>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

