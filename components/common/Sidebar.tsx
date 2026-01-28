'use client'

import { useState, useRef, useEffect, type ReactNode } from 'react'
import { CopilotChat } from '@copilotkit/react-ui'
import ChatIcon from '@mui/icons-material/Chat'
import CloseIcon from '@mui/icons-material/Close'
import DragHandleIcon from '@mui/icons-material/DragHandle'
import { IconButton } from '@mui/material'

export interface SidebarProps {
  children: ReactNode
  instructions?: string
  labels?: {
    title?: string
    initial?: string
  }
  defaultOpen?: boolean
}

const DEFAULT_WIDTH = 380
const MIN_WIDTH = 280

/**
 * 自定义 Sidebar 组件
 *
 * 功能：
 * 1. 挤压效果 - 主内容区域根据状态调整 marginRight
 * 2. 可拖动调整宽度 - 拖动左边框调整宽度
 * 3. Chat 铺满 - 使用 flex 布局让聊天区域填满剩余空间
 * 4. 输入框固定在底部 - CopilotChat 默认行为
 */
export function Sidebar({
  children,
  instructions,
  labels,
  defaultOpen = false,
}: SidebarProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)
  const [sidebarWidth, setSidebarWidth] = useState(DEFAULT_WIDTH)
  const [isDragging, setIsDragging] = useState(false)

  // 拖动处理
  const handleMouseDown = () => {
    setIsDragging(true)
  }

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return

      const newWidth = window.innerWidth - e.clientX
      if (newWidth >= MIN_WIDTH) {
        setSidebarWidth(newWidth)
      }
    }

    const handleMouseUp = () => {
      setIsDragging(false)
    }

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = 'ew-resize'
      document.body.style.userSelect = 'none'
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }
  }, [isDragging])

  return (
    <div style={{ display: 'flex', position: 'relative', minHeight: '100vh' }}>
      {/* 主内容区域 */}
      <div
        style={{
          flex: 1,
          transition: isDragging ? 'none' : 'margin-right 0.3s ease',
          marginRight: isOpen ? `${sidebarWidth}px` : 0,
        }}
      >
        {children}
      </div>

      {/* Sidebar 面板 */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          width: `${sidebarWidth}px`,
          height: '100vh',
          backgroundColor: '#1a1a2e',
          borderLeft: '1px solid rgba(255, 255, 255, 0.1)',
          transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: isDragging ? 'none' : 'transform 0.3s ease',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '16px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexShrink: 0,
          }}
        >
          <span style={{ color: '#f1f5f9', fontSize: '16px', fontWeight: 600 }}>
            {labels?.title || 'AI Assistant'}
          </span>
          <IconButton
            onClick={() => setIsOpen(false)}
            size="small"
            sx={{ color: '#94a3b8' }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </div>

        {/* Chat 内容 - 使用 flex 铺满 */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
          className="copilot-chat-container"
        >
          <CopilotChat
            instructions={instructions}
            labels={labels}
          />
        </div>

        {/* 拖动手柄 */}
        <div
          onMouseDown={handleMouseDown}
          style={{
            position: 'absolute',
            left: -4,
            top: 0,
            bottom: 0,
            width: '12px',
            cursor: 'ew-resize',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: isDragging ? 1 : 0,
            transition: 'opacity 0.2s',
            zIndex: 10,
          }}
          onMouseEnter={(e) => {
            if (!isDragging) {
              e.currentTarget.style.opacity = '0.6'
            }
          }}
          onMouseLeave={(e) => {
            if (!isDragging) {
              e.currentTarget.style.opacity = '0'
            }
          }}
        >
          <div
            style={{
              width: '3px',
              height: '48px',
              backgroundColor: '#6366f1',
              borderRadius: '1.5px',
              boxShadow: '0 0 8px rgba(99, 102, 241, 0.4)',
              pointerEvents: 'none',
            }}
          />
        </div>
      </div>

      {/* 打开按钮（当 Sidebar 关闭时显示） */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            backgroundColor: '#6366f1',
            color: 'white',
            border: 'none',
            cursor: 'pointer',
            zIndex: 9998,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(99, 102, 241, 0.4)',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.1)'
            e.currentTarget.style.boxShadow = '0 6px 16px rgba(99, 102, 241, 0.5)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)'
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(99, 102, 241, 0.4)'
          }}
        >
          <ChatIcon />
        </button>
      )}
    </div>
  )
}
