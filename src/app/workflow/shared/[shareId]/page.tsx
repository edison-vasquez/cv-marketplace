import { prisma } from '@/lib/db'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Eye, Layers, GitBranch, Clock, User, Copy } from 'lucide-react'

interface PageProps {
  params: Promise<{ shareId: string }>
}

async function getSharedWorkflow(shareId: string) {
  const workflow = await prisma.workflow.findFirst({
    where: {
      shareId,
      isPublic: true,
    },
    include: {
      user: {
        select: {
          name: true,
          image: true,
        },
      },
    },
  })

  if (!workflow) return null

  return {
    ...workflow,
    nodes: JSON.parse(workflow.nodes) as any[],
  }
}

export async function generateMetadata({ params }: PageProps) {
  const { shareId } = await params
  const workflow = await getSharedWorkflow(shareId)

  if (!workflow) {
    return { title: 'Workflow Not Found | VisionHub' }
  }

  return {
    title: `${workflow.name} | Shared Workflow | VisionHub`,
    description: workflow.description || `Shared workflow with ${workflow.nodes.length} blocks`,
  }
}

export default async function SharedWorkflowPage({ params }: PageProps) {
  const { shareId } = await params
  const workflow = await getSharedWorkflow(shareId)

  if (!workflow) {
    notFound()
  }

  const nodeTypes = {
    model: { color: 'bg-[#e8f0fe] text-[#1a73e8] border-[#1a73e8]/20', icon: Eye },
    logic: { color: 'bg-[#fef7e0] text-[#f9ab00] border-[#f9ab00]/20', icon: GitBranch },
    output: { color: 'bg-[#e6f4ea] text-[#34a853] border-[#34a853]/20', icon: Layers },
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-[#5f6368] hover:text-[#202124] transition-colors mb-8 text-sm font-medium"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Marketplace
      </Link>

      <div className="bg-white border border-[#dadce0] rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="p-8 border-b border-[#dadce0]">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <span className="px-2.5 py-1 bg-[#e8f0fe] text-[#1a73e8] text-xs font-bold rounded-full">
                  Shared Workflow
                </span>
                <span className="text-sm text-[#5f6368]">
                  {workflow.nodes.length} blocks
                </span>
              </div>
              <h1 className="text-3xl font-bold text-[#202124] mb-2">{workflow.name}</h1>
              {workflow.description && (
                <p className="text-[#5f6368]">{workflow.description}</p>
              )}
            </div>

            <Link
              href={`/workflow/builder`}
              className="px-4 py-2 bg-[#1a73e8] hover:bg-[#1557b0] text-white rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
            >
              <Copy className="w-4 h-4" />
              Clone Workflow
            </Link>
          </div>

          <div className="flex items-center gap-6 mt-6 text-sm text-[#5f6368]">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              {workflow.user.name || 'Anonymous'}
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              {new Date(workflow.createdAt).toLocaleDateString()}
            </div>
          </div>
        </div>

        {/* Workflow Visualization */}
        <div className="p-8 bg-[#f8f9fa]">
          <h2 className="text-sm font-bold text-[#202124] uppercase tracking-wider mb-4">
            Pipeline Structure
          </h2>

          <div className="flex flex-wrap gap-4">
            {workflow.nodes.map((node, index) => {
              const typeConfig = nodeTypes[node.type as keyof typeof nodeTypes] || nodeTypes.model
              const Icon = typeConfig.icon

              return (
                <div key={node.id || index} className="flex items-center">
                  <div className={`p-4 border rounded-xl ${typeConfig.color}`}>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white/50 rounded-lg flex items-center justify-center">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{node.name}</p>
                        <p className="text-xs opacity-70 capitalize">{node.type}</p>
                      </div>
                    </div>
                  </div>

                  {index < workflow.nodes.length - 1 && (
                    <div className="w-8 h-0.5 bg-[#dadce0] mx-2" />
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Nodes Detail */}
        <div className="p-8">
          <h2 className="text-sm font-bold text-[#202124] uppercase tracking-wider mb-4">
            Block Configuration
          </h2>

          <div className="space-y-4">
            {workflow.nodes.map((node, index) => (
              <div
                key={node.id || index}
                className="p-4 bg-[#f8f9fa] border border-[#dadce0] rounded-xl"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 bg-[#1a73e8] text-white rounded-full text-xs font-bold flex items-center justify-center">
                      {index + 1}
                    </span>
                    <span className="font-medium text-[#202124]">{node.name}</span>
                  </div>
                  <span className={`px-2 py-0.5 text-xs font-bold rounded capitalize ${
                    nodeTypes[node.type as keyof typeof nodeTypes]?.color || 'bg-gray-100 text-gray-600'
                  }`}>
                    {node.type}
                  </span>
                </div>

                {node.config && Object.keys(node.config).length > 0 && (
                  <div className="mt-3 pt-3 border-t border-[#dadce0]">
                    <p className="text-xs text-[#5f6368] mb-2">Configuration:</p>
                    <pre className="text-xs bg-white p-3 rounded-lg overflow-x-auto text-[#202124]">
                      {JSON.stringify(node.config, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Export JSON */}
        <div className="p-8 border-t border-[#dadce0] bg-[#f8f9fa]">
          <h2 className="text-sm font-bold text-[#202124] uppercase tracking-wider mb-4">
            Export
          </h2>
          <pre className="bg-white border border-[#dadce0] rounded-xl p-4 text-xs overflow-x-auto max-h-64">
            {JSON.stringify({
              name: workflow.name,
              description: workflow.description,
              nodes: workflow.nodes,
            }, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  )
}
