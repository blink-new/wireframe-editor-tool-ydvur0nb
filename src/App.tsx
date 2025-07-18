import React, { useState, useRef, useCallback } from 'react'
import { Button } from './components/ui/button'
import { Card } from './components/ui/card'
import { Separator } from './components/ui/separator'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './components/ui/tooltip'
import { 
  Square, 
  Type, 
  Image, 
  Circle, 
  MousePointer, 
  Hand,
  ZoomIn, 
  ZoomOut, 
  Grid3X3, 
  Undo2, 
  Redo2,
  Save,
  Share,
  Download,
  Upload,
  Menu,
  Settings,
  Trash2,
  Copy,
  Move
} from 'lucide-react'

interface WireframeElement {
  id: string
  type: 'rectangle' | 'circle' | 'text' | 'image' | 'button'
  x: number
  y: number
  width: number
  height: number
  text?: string
  selected?: boolean
}

function App() {
  const [elements, setElements] = useState<WireframeElement[]>([])
  const [selectedTool, setSelectedTool] = useState<string>('select')
  const [selectedElement, setSelectedElement] = useState<string | null>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [showGrid, setShowGrid] = useState(true)
  const [zoom, setZoom] = useState(100)
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null)
  const canvasRef = useRef<HTMLDivElement>(null)

  const tools = [
    { id: 'select', icon: MousePointer, label: 'Select' },
    { id: 'pan', icon: Hand, label: 'Pan' },
    { id: 'rectangle', icon: Square, label: 'Rectangle' },
    { id: 'circle', icon: Circle, label: 'Circle' },
    { id: 'text', icon: Type, label: 'Text' },
    { id: 'image', icon: Image, label: 'Image' },
  ]

  const handleCanvasMouseDown = useCallback((e: React.MouseEvent) => {
    if (!canvasRef.current) return
    
    const rect = canvasRef.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) / (zoom / 100)
    const y = (e.clientY - rect.top) / (zoom / 100)
    
    if (selectedTool === 'select') {
      // Check if clicking on an element
      const clickedElement = elements.find(el => 
        x >= el.x && x <= el.x + el.width && 
        y >= el.y && y <= el.y + el.height
      )
      
      if (clickedElement) {
        setSelectedElement(clickedElement.id)
        setElements(prev => prev.map(el => ({
          ...el,
          selected: el.id === clickedElement.id
        })))
      } else {
        setSelectedElement(null)
        setElements(prev => prev.map(el => ({ ...el, selected: false })))
      }
    } else if (['rectangle', 'circle', 'text', 'image'].includes(selectedTool)) {
      setIsDrawing(true)
      setDragStart({ x, y })
    }
  }, [selectedTool, elements, zoom])

  const handleCanvasMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDrawing || !dragStart || !canvasRef.current) return
    
    const rect = canvasRef.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) / (zoom / 100)
    const y = (e.clientY - rect.top) / (zoom / 100)
    
    // Update preview element while dragging
    const width = Math.abs(x - dragStart.x)
    const height = Math.abs(y - dragStart.y)
    const elementX = Math.min(x, dragStart.x)
    const elementY = Math.min(y, dragStart.y)
    
    // This would show a preview - for now we'll just handle on mouse up
  }, [isDrawing, dragStart, zoom])

  const handleCanvasMouseUp = useCallback((e: React.MouseEvent) => {
    if (!isDrawing || !dragStart || !canvasRef.current) return
    
    const rect = canvasRef.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) / (zoom / 100)
    const y = (e.clientY - rect.top) / (zoom / 100)
    
    const width = Math.abs(x - dragStart.x)
    const height = Math.abs(y - dragStart.y)
    const elementX = Math.min(x, dragStart.x)
    const elementY = Math.min(y, dragStart.y)
    
    if (width > 10 && height > 10) { // Minimum size
      const newElement: WireframeElement = {
        id: `element-${Date.now()}`,
        type: selectedTool as any,
        x: elementX,
        y: elementY,
        width,
        height,
        text: selectedTool === 'text' ? 'Text' : selectedTool === 'image' ? 'Image' : undefined
      }
      
      setElements(prev => [...prev, newElement])
    }
    
    setIsDrawing(false)
    setDragStart(null)
  }, [isDrawing, dragStart, selectedTool, zoom])

  const deleteSelectedElement = () => {
    if (selectedElement) {
      setElements(prev => prev.filter(el => el.id !== selectedElement))
      setSelectedElement(null)
    }
  }

  const duplicateSelectedElement = () => {
    if (selectedElement) {
      const element = elements.find(el => el.id === selectedElement)
      if (element) {
        const newElement = {
          ...element,
          id: `element-${Date.now()}`,
          x: element.x + 20,
          y: element.y + 20,
          selected: false
        }
        setElements(prev => [...prev, newElement])
      }
    }
  }

  const renderElement = (element: WireframeElement) => {
    const baseStyle = {
      position: 'absolute' as const,
      left: element.x,
      top: element.y,
      width: element.width,
      height: element.height,
      border: element.selected ? '2px solid #6366F1' : '2px solid #374151',
      borderStyle: 'dashed',
      backgroundColor: element.type === 'rectangle' ? '#F3F4F6' : 'transparent',
      borderRadius: element.type === 'circle' ? '50%' : '4px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '14px',
      color: '#374151',
      fontFamily: 'Inter, sans-serif',
      cursor: selectedTool === 'select' ? 'pointer' : 'default',
      userSelect: 'none' as const,
      boxSizing: 'border-box' as const
    }

    return (
      <div
        key={element.id}
        style={baseStyle}
        onClick={(e) => {
          e.stopPropagation()
          if (selectedTool === 'select') {
            setSelectedElement(element.id)
            setElements(prev => prev.map(el => ({
              ...el,
              selected: el.id === element.id
            })))
          }
        }}
      >
        {element.type === 'text' && (element.text || 'Text')}
        {element.type === 'image' && '🖼️ Image'}
        {element.type === 'rectangle' && 'Box'}
        {element.type === 'circle' && 'Circle'}
      </div>
    )
  }

  return (
    <TooltipProvider>
      <div className="h-screen bg-gray-50 flex flex-col">
        {/* Top Toolbar */}
        <div className="bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-lg font-semibold text-gray-900">Wireframe Editor</h1>
            <Separator orientation="vertical" className="h-6" />
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm">
                <Upload className="w-4 h-4 mr-2" />
                Open
              </Button>
              <Button variant="ghost" size="sm">
                <Save className="w-4 h-4 mr-2" />
                Save
              </Button>
              <Button variant="ghost" size="sm">
                <Share className="w-4 h-4 mr-2" />
                Share
              </Button>
              <Button variant="ghost" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant={showGrid ? "default" : "ghost"} 
                  size="sm"
                  onClick={() => setShowGrid(!showGrid)}
                >
                  <Grid3X3 className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Toggle Grid</TooltipContent>
            </Tooltip>
            
            <div className="flex items-center space-x-1">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setZoom(Math.max(25, zoom - 25))}
              >
                <ZoomOut className="w-4 h-4" />
              </Button>
              <span className="text-sm text-gray-600 min-w-[50px] text-center">{zoom}%</span>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setZoom(Math.min(200, zoom + 25))}
              >
                <ZoomIn className="w-4 h-4" />
              </Button>
            </div>
            
            <Separator orientation="vertical" className="h-6" />
            
            <Button variant="ghost" size="sm">
              <Undo2 className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Redo2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="flex-1 flex">
          {/* Left Sidebar - Tools */}
          <div className="w-16 bg-white border-r border-gray-200 flex flex-col items-center py-4 space-y-2">
            {tools.map((tool) => (
              <Tooltip key={tool.id}>
                <TooltipTrigger asChild>
                  <Button
                    variant={selectedTool === tool.id ? "default" : "ghost"}
                    size="sm"
                    className="w-10 h-10 p-0"
                    onClick={() => setSelectedTool(tool.id)}
                  >
                    <tool.icon className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">{tool.label}</TooltipContent>
              </Tooltip>
            ))}
          </div>

          {/* Main Canvas Area */}
          <div className="flex-1 relative overflow-hidden">
            <div 
              ref={canvasRef}
              className="w-full h-full relative cursor-crosshair"
              style={{
                backgroundImage: showGrid ? 
                  `radial-gradient(circle, #d1d5db 1px, transparent 1px)` : 'none',
                backgroundSize: showGrid ? `${20 * (zoom / 100)}px ${20 * (zoom / 100)}px` : 'auto',
                transform: `scale(${zoom / 100})`,
                transformOrigin: 'top left'
              }}
              onMouseDown={handleCanvasMouseDown}
              onMouseMove={handleCanvasMouseMove}
              onMouseUp={handleCanvasMouseUp}
            >
              {elements.map(renderElement)}
            </div>
          </div>

          {/* Right Sidebar - Properties */}
          <div className="w-64 bg-white border-l border-gray-200 p-4">
            <h3 className="font-medium text-gray-900 mb-4">Properties</h3>
            
            {selectedElement ? (
              <div className="space-y-4">
                <Card className="p-3">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Element Actions</h4>
                  <div className="space-y-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full justify-start"
                      onClick={duplicateSelectedElement}
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Duplicate
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full justify-start text-red-600 hover:text-red-700"
                      onClick={deleteSelectedElement}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </Card>
                
                <Card className="p-3">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Position & Size</h4>
                  <div className="space-y-2 text-xs text-gray-600">
                    {(() => {
                      const element = elements.find(el => el.id === selectedElement)
                      if (!element) return null
                      return (
                        <>
                          <div>X: {Math.round(element.x)}px</div>
                          <div>Y: {Math.round(element.y)}px</div>
                          <div>W: {Math.round(element.width)}px</div>
                          <div>H: {Math.round(element.height)}px</div>
                        </>
                      )
                    })()}
                  </div>
                </Card>
              </div>
            ) : (
              <div className="text-sm text-gray-500">
                Select an element to view properties
              </div>
            )}

            <div className="mt-8">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Components Library</h4>
              <div className="grid grid-cols-2 gap-2">
                {tools.slice(2).map((tool) => (
                  <Button
                    key={tool.id}
                    variant="outline"
                    size="sm"
                    className="h-12 flex flex-col items-center justify-center"
                    onClick={() => setSelectedTool(tool.id)}
                  >
                    <tool.icon className="w-4 h-4 mb-1" />
                    <span className="text-xs">{tool.label}</span>
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Status Bar */}
        <div className="bg-white border-t border-gray-200 px-4 py-2 flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center space-x-4">
            <span>Elements: {elements.length}</span>
            <span>Selected: {selectedElement ? '1' : '0'}</span>
          </div>
          <div className="flex items-center space-x-2">
            <span>Tool: {tools.find(t => t.id === selectedTool)?.label}</span>
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}

export default App