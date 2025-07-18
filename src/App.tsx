import React, { useState, useRef, useCallback, useEffect } from 'react'
import { Button } from './components/ui/button'
import { Card } from './components/ui/card'
import { Separator } from './components/ui/separator'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './components/ui/tooltip'
import { Input } from './components/ui/input'
import { Label } from './components/ui/label'
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
  Move,
  RotateCcw,
  Smartphone,
  Monitor,
  Tablet,
  ArrowUpDown,
  ArrowLeftRight,
  Minus,
  Plus,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Bold,
  Italic,
  Underline,
  Link,
  List,
  CheckSquare,
  Radio,
  ToggleLeft,
  Navigation,
  Layers,
  Eye,
  EyeOff
} from 'lucide-react'

interface WireframeElement {
  id: string
  type: 'rectangle' | 'circle' | 'text' | 'image' | 'button' | 'input' | 'checkbox' | 'radio' | 'toggle' | 'navbar' | 'sidebar' | 'line'
  x: number
  y: number
  width: number
  height: number
  text?: string
  selected?: boolean
  visible?: boolean
  locked?: boolean
  style?: {
    backgroundColor?: string
    borderColor?: string
    borderWidth?: number
    borderStyle?: 'solid' | 'dashed' | 'dotted'
    fontSize?: number
    fontWeight?: 'normal' | 'bold'
    textAlign?: 'left' | 'center' | 'right'
    opacity?: number
  }
}

interface HistoryState {
  elements: WireframeElement[]
  timestamp: number
}

function App() {
  const [elements, setElements] = useState<WireframeElement[]>([])
  const [selectedTool, setSelectedTool] = useState<string>('select')
  const [selectedElement, setSelectedElement] = useState<string | null>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [showGrid, setShowGrid] = useState(true)
  const [zoom, setZoom] = useState(100)
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null)
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number } | null>(null)
  const [history, setHistory] = useState<HistoryState[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [canvasSize, setCanvasSize] = useState({ width: 1200, height: 800 })
  const [deviceFrame, setDeviceFrame] = useState<'desktop' | 'tablet' | 'mobile'>('desktop')
  const [showLayers, setShowLayers] = useState(true)
  const canvasRef = useRef<HTMLDivElement>(null)

  const tools = [
    { id: 'select', icon: MousePointer, label: 'Select' },
    { id: 'pan', icon: Hand, label: 'Pan' },
    { id: 'rectangle', icon: Square, label: 'Rectangle' },
    { id: 'circle', icon: Circle, label: 'Circle' },
    { id: 'text', icon: Type, label: 'Text' },
    { id: 'image', icon: Image, label: 'Image' },
    { id: 'button', icon: Square, label: 'Button' },
    { id: 'input', icon: Minus, label: 'Input Field' },
    { id: 'checkbox', icon: CheckSquare, label: 'Checkbox' },
    { id: 'radio', icon: Radio, label: 'Radio Button' },
    { id: 'toggle', icon: ToggleLeft, label: 'Toggle' },
    { id: 'navbar', icon: Navigation, label: 'Navigation Bar' },
    { id: 'sidebar', icon: Menu, label: 'Sidebar' },
    { id: 'line', icon: Minus, label: 'Line' },
  ]

  // Save state to history
  const saveToHistory = useCallback(() => {
    const newState: HistoryState = {
      elements: [...elements],
      timestamp: Date.now()
    }
    
    const newHistory = history.slice(0, historyIndex + 1)
    newHistory.push(newState)
    
    // Limit history to 50 states
    if (newHistory.length > 50) {
      newHistory.shift()
    } else {
      setHistoryIndex(historyIndex + 1)
    }
    
    setHistory(newHistory)
  }, [elements, history, historyIndex])

  // Undo
  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const prevState = history[historyIndex - 1]
      setElements(prevState.elements)
      setHistoryIndex(historyIndex - 1)
    }
  }, [history, historyIndex])

  // Redo
  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const nextState = history[historyIndex + 1]
      setElements(nextState.elements)
      setHistoryIndex(historyIndex + 1)
    }
  }, [history, historyIndex])

  const deleteSelectedElement = useCallback(() => {
    if (selectedElement) {
      setElements(prev => prev.filter(el => el.id !== selectedElement))
      setSelectedElement(null)
      saveToHistory()
    }
  }, [selectedElement, saveToHistory])

  const duplicateSelectedElement = useCallback(() => {
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
        saveToHistory()
      }
    }
  }, [selectedElement, elements, saveToHistory])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'z':
            e.preventDefault()
            if (e.shiftKey) {
              redo()
            } else {
              undo()
            }
            break
          case 'c':
            e.preventDefault()
            if (selectedElement) {
              duplicateSelectedElement()
            }
            break
          case 's':
            e.preventDefault()
            // Save functionality would go here
            break
        }
      }
      
      if (e.key === 'Delete' && selectedElement) {
        deleteSelectedElement()
      }
      
      if (e.key === 'Escape') {
        setSelectedElement(null)
        setElements(prev => prev.map(el => ({ ...el, selected: false })))
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedElement, undo, redo, duplicateSelectedElement, deleteSelectedElement])

  const getCanvasCoordinates = useCallback((e: React.MouseEvent) => {
    if (!canvasRef.current) return { x: 0, y: 0 }
    
    const rect = canvasRef.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) / (zoom / 100)
    const y = (e.clientY - rect.top) / (zoom / 100)
    
    return { x, y }
  }, [zoom])

  const handleCanvasMouseDown = useCallback((e: React.MouseEvent) => {
    const { x, y } = getCanvasCoordinates(e)
    
    if (selectedTool === 'select') {
      // Check if clicking on an element
      const clickedElement = elements.find(el => 
        el.visible !== false &&
        x >= el.x && x <= el.x + el.width && 
        y >= el.y && y <= el.y + el.height
      )
      
      if (clickedElement) {
        setSelectedElement(clickedElement.id)
        setElements(prev => prev.map(el => ({
          ...el,
          selected: el.id === clickedElement.id
        })))
        
        // Start dragging
        setIsDragging(true)
        setDragOffset({
          x: x - clickedElement.x,
          y: y - clickedElement.y
        })
      } else {
        setSelectedElement(null)
        setElements(prev => prev.map(el => ({ ...el, selected: false })))
      }
    } else if (['rectangle', 'circle', 'text', 'image', 'button', 'input', 'checkbox', 'radio', 'toggle', 'navbar', 'sidebar', 'line'].includes(selectedTool)) {
      setIsDrawing(true)
      setDragStart({ x, y })
    }
  }, [selectedTool, elements, getCanvasCoordinates])

  const handleCanvasMouseMove = useCallback((e: React.MouseEvent) => {
    const { x, y } = getCanvasCoordinates(e)
    
    if (isDragging && selectedElement && dragOffset) {
      // Move selected element
      setElements(prev => prev.map(el => 
        el.id === selectedElement 
          ? { ...el, x: x - dragOffset.x, y: y - dragOffset.y }
          : el
      ))
    }
  }, [isDragging, selectedElement, dragOffset, getCanvasCoordinates])

  const handleCanvasMouseUp = useCallback((e: React.MouseEvent) => {
    const { x, y } = getCanvasCoordinates(e)
    
    if (isDrawing && dragStart) {
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
          text: getDefaultText(selectedTool),
          visible: true,
          locked: false,
          style: getDefaultStyle(selectedTool)
        }
        
        setElements(prev => [...prev, newElement])
        saveToHistory()
      }
    }
    
    if (isDragging) {
      saveToHistory()
    }
    
    setIsDrawing(false)
    setIsDragging(false)
    setDragStart(null)
    setDragOffset(null)
  }, [isDrawing, isDragging, dragStart, selectedTool, getCanvasCoordinates, saveToHistory])

  const getDefaultText = (toolType: string): string => {
    switch (toolType) {
      case 'text': return 'Text'
      case 'button': return 'Button'
      case 'input': return 'Input field'
      case 'checkbox': return 'Checkbox'
      case 'radio': return 'Radio button'
      case 'toggle': return 'Toggle'
      case 'navbar': return 'Navigation'
      case 'sidebar': return 'Sidebar'
      case 'image': return 'Image'
      default: return ''
    }
  }

  const getDefaultStyle = (toolType: string) => {
    const baseStyle = {
      backgroundColor: '#F3F4F6',
      borderColor: '#374151',
      borderWidth: 2,
      borderStyle: 'dashed' as const,
      fontSize: 14,
      fontWeight: 'normal' as const,
      textAlign: 'center' as const,
      opacity: 1
    }

    switch (toolType) {
      case 'button':
        return { ...baseStyle, backgroundColor: '#E5E7EB', borderStyle: 'solid' as const }
      case 'input':
        return { ...baseStyle, backgroundColor: '#FFFFFF', borderStyle: 'solid' as const, textAlign: 'left' as const }
      case 'navbar':
        return { ...baseStyle, backgroundColor: '#1F2937', borderStyle: 'solid' as const }
      case 'sidebar':
        return { ...baseStyle, backgroundColor: '#F9FAFB', borderStyle: 'solid' as const }
      default:
        return baseStyle
    }
  }



  const toggleElementVisibility = (elementId: string) => {
    setElements(prev => prev.map(el => 
      el.id === elementId 
        ? { ...el, visible: !el.visible }
        : el
    ))
  }

  const updateElementStyle = (property: string, value: any) => {
    if (selectedElement) {
      setElements(prev => prev.map(el => 
        el.id === selectedElement 
          ? { ...el, style: { ...el.style, [property]: value } }
          : el
      ))
    }
  }

  const updateElementText = (text: string) => {
    if (selectedElement) {
      setElements(prev => prev.map(el => 
        el.id === selectedElement 
          ? { ...el, text }
          : el
      ))
    }
  }

  const renderElement = (element: WireframeElement) => {
    if (element.visible === false) return null

    const baseStyle = {
      position: 'absolute' as const,
      left: element.x,
      top: element.y,
      width: element.width,
      height: element.height,
      border: `${element.style?.borderWidth || 2}px ${element.style?.borderStyle || 'dashed'} ${element.selected ? '#6366F1' : element.style?.borderColor || '#374151'}`,
      backgroundColor: element.style?.backgroundColor || '#F3F4F6',
      borderRadius: element.type === 'circle' ? '50%' : element.type === 'button' ? '6px' : '4px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: element.style?.textAlign === 'left' ? 'flex-start' : element.style?.textAlign === 'right' ? 'flex-end' : 'center',
      fontSize: element.style?.fontSize || 14,
      fontWeight: element.style?.fontWeight || 'normal',
      color: element.style?.borderColor || '#374151',
      fontFamily: 'Inter, sans-serif',
      cursor: selectedTool === 'select' ? 'move' : 'default',
      userSelect: 'none' as const,
      boxSizing: 'border-box' as const,
      padding: element.type === 'input' || element.type === 'text' ? '8px' : '4px',
      opacity: element.style?.opacity || 1,
      boxShadow: element.selected ? '0 0 0 2px #6366F1' : 'none',
      transition: 'box-shadow 0.1s ease'
    }

    const getElementContent = () => {
      switch (element.type) {
        case 'checkbox':
          return (
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-gray-600 rounded"></div>
              <span>{element.text}</span>
            </div>
          )
        case 'radio':
          return (
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-gray-600 rounded-full"></div>
              <span>{element.text}</span>
            </div>
          )
        case 'toggle':
          return (
            <div className="flex items-center space-x-2">
              <div className="w-8 h-4 bg-gray-300 rounded-full relative">
                <div className="w-3 h-3 bg-white rounded-full absolute top-0.5 left-0.5"></div>
              </div>
              <span>{element.text}</span>
            </div>
          )
        case 'image':
          return (
            <div className="flex flex-col items-center justify-center text-gray-500">
              <Image className="w-6 h-6 mb-1" />
              <span className="text-xs">{element.text}</span>
            </div>
          )
        case 'line':
          return null
        default:
          return element.text || element.type
      }
    }

    return (
      <div
        key={element.id}
        style={element.type === 'line' ? {
          ...baseStyle,
          backgroundColor: 'transparent',
          borderTop: `${element.style?.borderWidth || 2}px ${element.style?.borderStyle || 'solid'} ${element.style?.borderColor || '#374151'}`,
          border: 'none',
          height: 0,
          width: element.width
        } : baseStyle}
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
        {getElementContent()}
      </div>
    )
  }

  const getDeviceFrameSize = () => {
    switch (deviceFrame) {
      case 'mobile':
        return { width: 375, height: 667 }
      case 'tablet':
        return { width: 768, height: 1024 }
      default:
        return { width: 1200, height: 800 }
    }
  }

  const frameSize = getDeviceFrameSize()

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
          
          <div className="flex items-center space-x-4">
            {/* Device Frame Selector */}
            <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant={deviceFrame === 'desktop' ? "default" : "ghost"} 
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => setDeviceFrame('desktop')}
                  >
                    <Monitor className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Desktop</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant={deviceFrame === 'tablet' ? "default" : "ghost"} 
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => setDeviceFrame('tablet')}
                  >
                    <Tablet className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Tablet</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant={deviceFrame === 'mobile' ? "default" : "ghost"} 
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => setDeviceFrame('mobile')}
                  >
                    <Smartphone className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Mobile</TooltipContent>
              </Tooltip>
            </div>

            <Separator orientation="vertical" className="h-6" />
            
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
            
            <Button 
              variant="ghost" 
              size="sm"
              onClick={undo}
              disabled={historyIndex <= 0}
            >
              <Undo2 className="w-4 h-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={redo}
              disabled={historyIndex >= history.length - 1}
            >
              <Redo2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="flex-1 flex">
          {/* Left Sidebar - Tools */}
          <div className="w-16 bg-white border-r border-gray-200 flex flex-col items-center py-4 space-y-2">
            {tools.slice(0, 8).map((tool) => (
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
            
            <Separator className="w-8" />
            
            {tools.slice(8).map((tool) => (
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
          <div className="flex-1 relative overflow-auto bg-gray-100">
            <div className="flex items-center justify-center min-h-full p-8">
              <div 
                className="bg-white shadow-lg relative"
                style={{
                  width: frameSize.width,
                  height: frameSize.height,
                  transform: `scale(${zoom / 100})`,
                  transformOrigin: 'center',
                }}
              >
                <div 
                  ref={canvasRef}
                  className="w-full h-full relative cursor-crosshair overflow-hidden"
                  style={{
                    backgroundImage: showGrid ? 
                      `radial-gradient(circle, #d1d5db 1px, transparent 1px)` : 'none',
                    backgroundSize: showGrid ? '20px 20px' : 'auto',
                  }}
                  onMouseDown={handleCanvasMouseDown}
                  onMouseMove={handleCanvasMouseMove}
                  onMouseUp={handleCanvasMouseUp}
                >
                  {elements.map(renderElement)}
                </div>
              </div>
            </div>
          </div>

          {/* Right Sidebar - Properties & Layers */}
          <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
            {/* Properties Panel */}
            <div className="p-4 border-b border-gray-200">
              <h3 className="font-medium text-gray-900 mb-4">Properties</h3>
              
              {selectedElement ? (
                <div className="space-y-4">
                  {(() => {
                    const element = elements.find(el => el.id === selectedElement)
                    if (!element) return null
                    
                    return (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="element-text">Text</Label>
                          <Input
                            id="element-text"
                            value={element.text || ''}
                            onChange={(e) => updateElementText(e.target.value)}
                            placeholder="Enter text..."
                          />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <Label htmlFor="element-x">X</Label>
                            <Input
                              id="element-x"
                              type="number"
                              value={Math.round(element.x)}
                              onChange={(e) => {
                                const value = parseInt(e.target.value) || 0
                                setElements(prev => prev.map(el => 
                                  el.id === selectedElement ? { ...el, x: value } : el
                                ))
                              }}
                            />
                          </div>
                          <div>
                            <Label htmlFor="element-y">Y</Label>
                            <Input
                              id="element-y"
                              type="number"
                              value={Math.round(element.y)}
                              onChange={(e) => {
                                const value = parseInt(e.target.value) || 0
                                setElements(prev => prev.map(el => 
                                  el.id === selectedElement ? { ...el, y: value } : el
                                ))
                              }}
                            />
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <Label htmlFor="element-width">Width</Label>
                            <Input
                              id="element-width"
                              type="number"
                              value={Math.round(element.width)}
                              onChange={(e) => {
                                const value = parseInt(e.target.value) || 1
                                setElements(prev => prev.map(el => 
                                  el.id === selectedElement ? { ...el, width: value } : el
                                ))
                              }}
                            />
                          </div>
                          <div>
                            <Label htmlFor="element-height">Height</Label>
                            <Input
                              id="element-height"
                              type="number"
                              value={Math.round(element.height)}
                              onChange={(e) => {
                                const value = parseInt(e.target.value) || 1
                                setElements(prev => prev.map(el => 
                                  el.id === selectedElement ? { ...el, height: value } : el
                                ))
                              }}
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label>Text Alignment</Label>
                          <div className="flex space-x-1">
                            <Button
                              variant={element.style?.textAlign === 'left' ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => updateElementStyle('textAlign', 'left')}
                            >
                              <AlignLeft className="w-4 h-4" />
                            </Button>
                            <Button
                              variant={element.style?.textAlign === 'center' ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => updateElementStyle('textAlign', 'center')}
                            >
                              <AlignCenter className="w-4 h-4" />
                            </Button>
                            <Button
                              variant={element.style?.textAlign === 'right' ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => updateElementStyle('textAlign', 'right')}
                            >
                              <AlignRight className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        
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
                      </>
                    )
                  })()}
                </div>
              ) : (
                <div className="text-sm text-gray-500">
                  Select an element to view properties
                </div>
              )}
            </div>

            {/* Layers Panel */}
            <div className="flex-1 p-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-medium text-gray-700">Layers</h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowLayers(!showLayers)}
                >
                  <Layers className="w-4 h-4" />
                </Button>
              </div>
              
              {showLayers && (
                <div className="space-y-1 max-h-64 overflow-y-auto">
                  {elements.slice().reverse().map((element, index) => (
                    <div
                      key={element.id}
                      className={`flex items-center justify-between p-2 rounded cursor-pointer hover:bg-gray-50 ${
                        element.selected ? 'bg-blue-50 border border-blue-200' : ''
                      }`}
                      onClick={() => {
                        setSelectedElement(element.id)
                        setElements(prev => prev.map(el => ({
                          ...el,
                          selected: el.id === element.id
                        })))
                      }}
                    >
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 flex items-center justify-center">
                          {tools.find(t => t.id === element.type)?.icon && 
                            React.createElement(tools.find(t => t.id === element.type)!.icon, { 
                              className: "w-3 h-3" 
                            })
                          }
                        </div>
                        <span className="text-sm truncate">
                          {element.text || element.type}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleElementVisibility(element.id)
                        }}
                      >
                        {element.visible === false ? 
                          <EyeOff className="w-3 h-3" /> : 
                          <Eye className="w-3 h-3" />
                        }
                      </Button>
                    </div>
                  ))}
                  
                  {elements.length === 0 && (
                    <div className="text-sm text-gray-500 text-center py-4">
                      No elements yet
                    </div>
                  )}
                </div>
              )}

              <div className="mt-6">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Quick Add</h4>
                <div className="grid grid-cols-2 gap-2">
                  {tools.slice(2, 8).map((tool) => (
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
        </div>

        {/* Bottom Status Bar */}
        <div className="bg-white border-t border-gray-200 px-4 py-2 flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center space-x-4">
            <span>Elements: {elements.length}</span>
            <span>Selected: {selectedElement ? '1' : '0'}</span>
            <span>Canvas: {frameSize.width} × {frameSize.height}</span>
          </div>
          <div className="flex items-center space-x-2">
            <span>Tool: {tools.find(t => t.id === selectedTool)?.label}</span>
            <span>•</span>
            <span>Zoom: {zoom}%</span>
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}

export default App