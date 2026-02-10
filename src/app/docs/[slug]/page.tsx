import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Book, ChevronRight } from 'lucide-react'
import { getDocBySlug, getAllDocs, getDocsByCategory, type DocSection } from '@/lib/docs'

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const docs = getAllDocs()
  return docs.map(doc => ({ slug: doc.slug }))
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params
  const doc = getDocBySlug(slug)

  if (!doc) {
    return { title: 'Document Not Found | VisionHub' }
  }

  return {
    title: `${doc.title} | Documentation | VisionHub`,
    description: doc.description,
  }
}

function MarkdownContent({ content }: { content: string }) {
  // Simple markdown-like rendering
  const lines = content.trim().split('\n')
  const elements: React.ReactNode[] = []
  let inCodeBlock = false
  let codeContent: string[] = []
  let codeLanguage = ''
  let inTable = false
  let tableRows: string[][] = []

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    // Code blocks
    if (line.startsWith('```')) {
      if (inCodeBlock) {
        elements.push(
          <pre key={i} className="bg-[#1e1e1e] text-[#d4d4d4] rounded-xl p-4 overflow-x-auto my-4 text-sm">
            <code>{codeContent.join('\n')}</code>
          </pre>
        )
        codeContent = []
        inCodeBlock = false
      } else {
        codeLanguage = line.slice(3)
        inCodeBlock = true
      }
      continue
    }

    if (inCodeBlock) {
      codeContent.push(line)
      continue
    }

    // Tables
    if (line.startsWith('|')) {
      const cells = line.split('|').filter(c => c.trim()).map(c => c.trim())
      if (cells.length > 0 && !line.includes('---')) {
        tableRows.push(cells)
      }

      // Check if next line is not a table
      if (!lines[i + 1]?.startsWith('|') && tableRows.length > 0) {
        elements.push(
          <div key={i} className="overflow-x-auto my-4">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  {tableRows[0].map((cell, j) => (
                    <th key={j} className="border border-[#dadce0] bg-[#f8f9fa] px-4 py-2 text-left text-sm font-bold text-[#202124]">
                      {cell}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tableRows.slice(1).map((row, ri) => (
                  <tr key={ri}>
                    {row.map((cell, ci) => (
                      <td key={ci} className="border border-[#dadce0] px-4 py-2 text-sm text-[#5f6368]">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
        tableRows = []
        inTable = false
      }
      continue
    }

    // Headers
    if (line.startsWith('# ')) {
      elements.push(<h1 key={i} className="text-3xl font-bold text-[#202124] mt-8 mb-4">{line.slice(2)}</h1>)
      continue
    }
    if (line.startsWith('## ')) {
      elements.push(<h2 key={i} className="text-2xl font-bold text-[#202124] mt-8 mb-3">{line.slice(3)}</h2>)
      continue
    }
    if (line.startsWith('### ')) {
      elements.push(<h3 key={i} className="text-xl font-bold text-[#202124] mt-6 mb-2">{line.slice(4)}</h3>)
      continue
    }

    // Lists
    if (line.startsWith('- ') || line.startsWith('* ')) {
      elements.push(
        <li key={i} className="text-[#5f6368] ml-4 my-1 list-disc">
          {formatInlineCode(line.slice(2))}
        </li>
      )
      continue
    }

    if (/^\d+\.\s/.test(line)) {
      elements.push(
        <li key={i} className="text-[#5f6368] ml-4 my-1 list-decimal">
          {formatInlineCode(line.replace(/^\d+\.\s/, ''))}
        </li>
      )
      continue
    }

    // Empty lines
    if (line.trim() === '') {
      continue
    }

    // Regular paragraphs
    elements.push(
      <p key={i} className="text-[#5f6368] leading-relaxed my-4">
        {formatInlineCode(line)}
      </p>
    )
  }

  return <div className="prose max-w-none">{elements}</div>
}

function formatInlineCode(text: string): React.ReactNode {
  // Handle inline code
  const parts = text.split(/(`[^`]+`)/g)
  return parts.map((part, i) => {
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code key={i} className="bg-[#f1f3f4] text-[#d93025] px-1.5 py-0.5 rounded text-sm font-mono">
          {part.slice(1, -1)}
        </code>
      )
    }
    // Handle bold
    const boldParts = part.split(/(\*\*[^*]+\*\*)/g)
    return boldParts.map((bp, j) => {
      if (bp.startsWith('**') && bp.endsWith('**')) {
        return <strong key={`${i}-${j}`} className="text-[#202124] font-bold">{bp.slice(2, -2)}</strong>
      }
      return bp
    })
  })
}

export default async function DocPage({ params }: PageProps) {
  const { slug } = await params
  const doc = getDocBySlug(slug)

  if (!doc) {
    notFound()
  }

  const categoryDocs = getDocsByCategory(doc.category)
  const categoryTitles: Record<DocSection['category'], string> = {
    'getting-started': 'Getting Started',
    'guides': 'Guides',
    'api': 'API Reference',
    'faq': 'FAQ'
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-[#5f6368] mb-8">
        <Link href="/docs" className="hover:text-[#1a73e8] transition-colors">
          Documentation
        </Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-[#202124]">{doc.title}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 space-y-6">
            <Link
              href="/docs"
              className="flex items-center gap-2 text-[#5f6368] hover:text-[#1a73e8] transition-colors text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Docs
            </Link>

            <div className="bg-[#f8f9fa] border border-[#dadce0] rounded-xl p-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#5f6368] mb-3">
                {categoryTitles[doc.category]}
              </h3>
              <nav className="space-y-1">
                {categoryDocs.map(d => (
                  <Link
                    key={d.slug}
                    href={`/docs/${d.slug}`}
                    className={`block px-3 py-2 rounded-lg text-sm transition-colors ${
                      d.slug === slug
                        ? 'bg-[#e8f0fe] text-[#1a73e8] font-medium'
                        : 'text-[#5f6368] hover:bg-[#f1f3f4]'
                    }`}
                  >
                    {d.title}
                  </Link>
                ))}
              </nav>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <article className="bg-white border border-[#dadce0] rounded-2xl p-8 lg:p-12">
            <div className="flex items-center gap-3 mb-6">
              <span className="px-3 py-1 bg-[#e8f0fe] text-[#1a73e8] text-xs font-bold rounded-full uppercase">
                {categoryTitles[doc.category]}
              </span>
            </div>

            <MarkdownContent content={doc.content} />
          </article>

          {/* Navigation */}
          <div className="mt-8 flex justify-between">
            {categoryDocs.findIndex(d => d.slug === slug) > 0 && (
              <Link
                href={`/docs/${categoryDocs[categoryDocs.findIndex(d => d.slug === slug) - 1].slug}`}
                className="flex items-center gap-2 text-[#1a73e8] hover:underline"
              >
                <ArrowLeft className="w-4 h-4" />
                Previous
              </Link>
            )}
            <div className="flex-1" />
            {categoryDocs.findIndex(d => d.slug === slug) < categoryDocs.length - 1 && (
              <Link
                href={`/docs/${categoryDocs[categoryDocs.findIndex(d => d.slug === slug) + 1].slug}`}
                className="flex items-center gap-2 text-[#1a73e8] hover:underline"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
