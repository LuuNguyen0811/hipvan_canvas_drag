'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useProjectStore } from '@/lib/store'
import { generateHTML, generateCSSSeparate } from '@/lib/html-generator'
import { getImageAsBase64 } from '@/lib/image-storage'
import type { LayoutSection, Component } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  ArrowLeft,
  Download,
  Code,
  Eye,
  FileCode,
  FileText,
  Monitor,
  Tablet,
  Smartphone,
  Check,
  Copy,
  Layers,
  Pencil,
} from 'lucide-react'

type ViewportSize = 'desktop' | 'tablet' | 'mobile'

const viewportWidths: Record<ViewportSize, string> = {
  desktop: '100%',
  tablet: '768px',
  mobile: '375px',
}

// Helper function to recursively process components and load images as base64
async function processComponentImages(component: Component): Promise<Component> {
  const processed = { ...component }
  
  // If this is an image component with imageId, load it as base64
  if (component.type === 'image' && component.imageId) {
    const base64 = await getImageAsBase64(component.imageId)
    if (base64) {
      processed.src = base64
    }
  }
  
  // Process children recursively if they exist
  if (component.children && component.children.length > 0) {
    processed.children = await Promise.all(
      component.children.map(child => processComponentImages(child))
    )
  }
  
  return processed
}

// Helper function to prepare layout with all images as base64
async function prepareLayoutWithImages(layout: LayoutSection[]): Promise<LayoutSection[]> {
  const processedLayout = await Promise.all(
    layout.map(async (section) => {
      const processedComponents = await Promise.all(
        section.components.map(comp => processComponentImages(comp))
      )
      
      return {
        ...section,
        components: processedComponents
      }
    })
  )
  
  return processedLayout
}

export default function PreviewPage() {
  const params = useParams()
  const router = useRouter()
  const { projects, setCurrentProject, currentProject } = useProjectStore()
  const [isLoading, setIsLoading] = useState(true)
  const [viewport, setViewport] = useState<ViewportSize>('desktop')
  const [copied, setCopied] = useState<'html' | 'css' | null>(null)
  const [activeTab, setActiveTab] = useState<'preview' | 'html' | 'css'>('preview')
  const [htmlContent, setHtmlContent] = useState<string>('')
  const [cssContent, setCssContent] = useState<string>('')
  const [isProcessingImages, setIsProcessingImages] = useState(false)

  useEffect(() => {
    const projectId = params.id as string
    const project = projects.find((p) => p.id === projectId)
    
    if (project) {
      setCurrentProject(projectId)
      setIsLoading(false)
    } else {
      router.push('/')
    }
  }, [params.id, projects, setCurrentProject, router])

  // Generate HTML and CSS with images when project loads or changes
  useEffect(() => {
    if (!currentProject) return

    const generateContent = async () => {
      setIsProcessingImages(true)
      try {
        // Prepare layout with images as base64
        const layoutWithImages = await prepareLayoutWithImages(currentProject.layout)
        const html = generateHTML(layoutWithImages, currentProject.name)
        const css = generateCSSSeparate(layoutWithImages)
        
        setHtmlContent(html)
        setCssContent(css)
      } catch (error) {
        console.error('Failed to generate content:', error)
        // Fallback to content without images
        setHtmlContent(generateHTML(currentProject.layout, currentProject.name))
        setCssContent(generateCSSSeparate(currentProject.layout))
      } finally {
        setIsProcessingImages(false)
      }
    }

    generateContent()
  }, [currentProject])

  const handleDownloadHTML = () => {
    if (!currentProject || !htmlContent) return
    
    const blob = new Blob([htmlContent], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${currentProject.name.toLowerCase().replace(/\s+/g, '-')}.html`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleDownloadCSS = () => {
    if (!currentProject || !cssContent) return
    
    const blob = new Blob([cssContent], { type: 'text/css' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${currentProject.name.toLowerCase().replace(/\s+/g, '-')}.css`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleCopy = async (type: 'html' | 'css') => {
    const content = type === 'html' ? htmlContent : cssContent
    if (!content) return
    
    await navigator.clipboard.writeText(content)
    setCopied(type)
    setTimeout(() => setCopied(null), 2000)
  }

  if (isLoading || !currentProject) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-muted-foreground">Loading preview...</p>
        </div>
      </div>
    )
  }

  if (isProcessingImages && !htmlContent) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-muted-foreground">Processing images...</p>
        </div>
      </div>
    )
  }

  return (
    <TooltipProvider>
      <div className="flex h-screen flex-col bg-background">
        {/* Header */}
        <header className="flex h-14 items-center justify-between border-b border-border bg-card px-4">
          <div className="flex items-center gap-4">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => router.push('/')}
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Back to Dashboard</TooltipContent>
            </Tooltip>

            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Layers className="h-4 w-4 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-sm font-semibold text-foreground">{currentProject.name}</h1>
                <p className="text-xs text-muted-foreground">Preview & Export</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className="gap-2 bg-transparent"
              onClick={() => router.push(`/editor/${currentProject.id}`)}
            >
              <Pencil className="h-4 w-4" />
              Edit
            </Button>
            <Button
              variant="outline"
              className="gap-2 bg-transparent"
              onClick={handleDownloadCSS}
            >
              <FileCode className="h-4 w-4" />
              Download CSS
            </Button>
            <Button className="gap-2" onClick={handleDownloadHTML}>
              <Download className="h-4 w-4" />
              Download HTML
            </Button>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex flex-1 overflow-hidden">
          <Tabs
            value={activeTab}
            onValueChange={(v) => setActiveTab(v as typeof activeTab)}
            className="flex flex-1 flex-col"
          >
            {/* Tab Controls */}
            <div className="flex items-center justify-between border-b border-border bg-muted/30 px-4">
              <TabsList className="h-12 bg-transparent">
                <TabsTrigger value="preview" className="gap-2 data-[state=active]:bg-background">
                  <Eye className="h-4 w-4" />
                  Preview
                </TabsTrigger>
                <TabsTrigger value="html" className="gap-2 data-[state=active]:bg-background">
                  <FileText className="h-4 w-4" />
                  HTML
                </TabsTrigger>
                <TabsTrigger value="css" className="gap-2 data-[state=active]:bg-background">
                  <Code className="h-4 w-4" />
                  CSS
                </TabsTrigger>
              </TabsList>

              {activeTab === 'preview' && (
                <div className="flex items-center gap-1">
                  <Button
                    variant={viewport === 'desktop' ? 'secondary' : 'ghost'}
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setViewport('desktop')}
                  >
                    <Monitor className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewport === 'tablet' ? 'secondary' : 'ghost'}
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setViewport('tablet')}
                  >
                    <Tablet className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewport === 'mobile' ? 'secondary' : 'ghost'}
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setViewport('mobile')}
                  >
                    <Smartphone className="h-4 w-4" />
                  </Button>
                </div>
              )}

              {(activeTab === 'html' || activeTab === 'css') && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-2"
                  onClick={() => handleCopy(activeTab)}
                >
                  {copied === activeTab ? (
                    <>
                      <Check className="h-4 w-4 text-green-500" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      Copy
                    </>
                  )}
                </Button>
              )}
            </div>

            {/* Tab Content */}
            <TabsContent value="preview" className="m-0 flex-1 overflow-auto bg-muted/30 p-6">
              <div
                className="mx-auto overflow-hidden rounded-xl border border-border bg-background shadow-lg transition-all duration-300"
                style={{ maxWidth: viewportWidths[viewport] }}
              >
                <iframe
                  srcDoc={htmlContent}
                  title="Preview"
                  className="h-[calc(100vh-12rem)] w-full"
                  sandbox="allow-scripts"
                />
              </div>
            </TabsContent>

            <TabsContent value="html" className="m-0 flex-1 overflow-auto p-0">
              <div className="h-full overflow-auto bg-zinc-950">
                <pre className="p-6 text-sm">
                  <code className="text-zinc-100">{htmlContent}</code>
                </pre>
              </div>
            </TabsContent>

            <TabsContent value="css" className="m-0 flex-1 overflow-auto p-0">
              <div className="h-full overflow-auto bg-zinc-950">
                <pre className="p-6 text-sm">
                  <code className="text-zinc-100">{cssContent}</code>
                </pre>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </TooltipProvider>
  )
}
