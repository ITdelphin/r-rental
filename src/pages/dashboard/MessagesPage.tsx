import { useState, useEffect, useRef, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/ui/loading'
import { EmptyState } from '@/components/ui/empty-state'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Search, Send, MessageSquare, ChevronLeft, Trash2, Edit2, Check, X } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { messageApi } from '@/lib/api'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'
import type { Message } from '@/types'

interface Conversation {
  userId: string
  name: string
  avatarUrl: string | null
  lastMessage: string
  lastMessageTime: string
  unreadCount: number
  lastSenderId: string
}

export function MessagesPage() {
  const { t } = useTranslation()
  const { user, profile } = useAuth()
  const [loading, setLoading] = useState(true)
  const [messages, setMessages] = useState<Message[]>([])
  const [activeChatUser, setActiveChatUser] = useState<string | null>(null)
  const [newMessage, setNewMessage] = useState('')
  const [showMobileChat, setShowMobileChat] = useState(false)
  const [sending, setSending] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; show: boolean }>({ id: '', show: false })
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const fetchMessages = useCallback(async () => {
    if (!user) return
    try {
      const data = await messageApi.list(user.id)
      setMessages(data)
    } catch {
      setMessages([])
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    fetchMessages()
  }, [fetchMessages])

  // Real-time subscription
  useEffect(() => {
    if (!user) return
    const channel = supabase
      .channel('messages_channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages', filter: `sender_id=eq.${user.id}` }, () => fetchMessages())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages', filter: `receiver_id=eq.${user.id}` }, () => fetchMessages())
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [user, fetchMessages])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, activeChatUser])

  // Build conversations from messages
  const conversations: Conversation[] = (() => {
    if (!user) return []
    const convMap = new Map<string, Conversation>()
    for (const msg of messages) {
      const otherUserId = msg.sender_id === user.id ? msg.receiver_id : msg.sender_id
      const otherProfile = msg.sender_id === user.id ? msg.receiver : msg.sender
      const existing = convMap.get(otherUserId)
      const isUnread = msg.receiver_id === user.id && !msg.is_read
      if (!existing) {
        convMap.set(otherUserId, {
          userId: otherUserId,
          name: otherProfile?.full_name || 'Unknown',
          avatarUrl: otherProfile?.avatar_url || null,
          lastMessage: msg.content,
          lastMessageTime: formatMessageTime(msg.created_at),
          unreadCount: isUnread ? 1 : 0,
          lastSenderId: msg.sender_id,
        })
      } else {
        existing.lastMessage = msg.content
        existing.lastMessageTime = formatMessageTime(msg.created_at)
        existing.lastSenderId = msg.sender_id
        if (isUnread) existing.unreadCount += 1
      }
    }
    return [...convMap.values()]
  })()

  const chatMessages = messages
    .filter(m => {
      if (!activeChatUser) return false
      return (m.sender_id === user?.id && m.receiver_id === activeChatUser) ||
             (m.receiver_id === user?.id && m.sender_id === activeChatUser)
    })
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())

  const activeConversation = conversations.find(c => c.userId === activeChatUser)

  const handleSelectChat = (userId: string) => {
    setActiveChatUser(userId)
    setShowMobileChat(true)
    setEditingId(null)
    // Mark all as read
    const unread = messages.filter(m => m.sender_id === userId && m.receiver_id === user?.id && !m.is_read)
    unread.forEach(m => messageApi.markAsRead(m.id).catch(() => {}))
  }

  const handleSend = async () => {
    if (!newMessage.trim() || !user || !activeChatUser) return
    setSending(true)
    try {
      await messageApi.send({
        sender_id: user.id,
        receiver_id: activeChatUser,
        content: newMessage.trim(),
      } as never)
      setNewMessage('')
      inputRef.current?.focus()
    } catch {
      toast.error('Failed to send message')
    } finally {
      setSending(false)
    }
  }

  const handleEdit = async (id: string) => {
    if (!editContent.trim()) return
    try {
      await messageApi.update(id, { content: editContent.trim() } as never)
      setEditingId(null)
      setEditContent('')
      toast.success('Message updated')
    } catch {
      toast.error('Failed to update message')
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget.id) return
    try {
      await messageApi.remove(deleteTarget.id)
      setDeleteTarget({ id: '', show: false })
      toast.success('Message deleted')
    } catch {
      toast.error('Failed to delete message')
    }
  }

  const startEdit = (msg: Message) => {
    setEditingId(msg.id)
    setEditContent(msg.content)
  }

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-8rem)] items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-4">
      {/* Conversations sidebar */}
      <Card className={`w-full sm:w-80 flex-shrink-0 ${showMobileChat ? 'hidden sm:block' : 'block'}`}>
        <CardContent className="p-0 flex flex-col h-full">
          <div className="border-b p-3 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">{t('messages')}</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder={t('search_messages')}
                className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-4 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
              />
            </div>
          </div>

          {conversations.length === 0 ? (
            <EmptyState icon={MessageSquare} title={t('no_conversations')} description={t('no_conversations_description')} />
          ) : (
            <div className="flex-1 overflow-y-auto divide-y dark:divide-gray-700">
              {conversations.map((conv) => (
                <button
                  key={conv.userId}
                  onClick={() => handleSelectChat(conv.userId)}
                  className={`flex w-full items-start gap-3 p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer ${
                    activeChatUser === conv.userId ? 'bg-primary-50 dark:bg-primary-900/20' : ''
                  }`}
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-100 text-sm font-bold text-primary-600">
                    {conv.avatarUrl ? (
                      <img src={conv.avatarUrl} alt="" className="h-full w-full rounded-full object-cover" />
                    ) : (
                      conv.name.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{conv.name}</span>
                      <span className="text-xs text-gray-500">{conv.lastMessageTime}</span>
                    </div>
                    <p className="truncate text-sm text-gray-500">
                      {conv.lastSenderId === user?.id && <span className="text-primary-500">You: </span>}
                      {conv.lastMessage}
                    </p>
                  </div>
                  {conv.unreadCount > 0 && (
                    <div className="mt-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary-600 px-1.5 text-xs text-white">
                      {conv.unreadCount}
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Chat area */}
      <Card className={`flex-1 flex flex-col ${!showMobileChat ? 'hidden sm:flex' : 'flex'}`}>
        {activeChatUser && activeConversation ? (
          <>
            <div className="flex items-center gap-3 border-b p-4 dark:border-gray-700">
              <button onClick={() => setShowMobileChat(false)} className="sm:hidden p-1 cursor-pointer">
                <ChevronLeft className="h-5 w-5" />
              </button>
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-100 text-sm font-bold text-primary-600">
                {activeConversation.avatarUrl ? (
                  <img src={activeConversation.avatarUrl} alt="" className="h-full w-full rounded-full object-cover" />
                ) : (
                  activeConversation.name.charAt(0).toUpperCase()
                )}
              </div>
              <div>
                <h3 className="font-medium text-gray-900 dark:text-gray-100">{activeConversation.name}</h3>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {chatMessages.length === 0 ? (
                <div className="flex h-full items-center justify-center text-sm text-gray-400">
                  Send a message to start the conversation
                </div>
              ) : (
                chatMessages.map((msg) => {
                  const isMine = msg.sender_id === user?.id
                  return (
                    <div key={msg.id} className={`group flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                      <div className="max-w-[80%] sm:max-w-[70%]">
                        {editingId === msg.id ? (
                          <div className="flex gap-2 items-start">
                            <input
                              type="text"
                              value={editContent}
                              onChange={e => setEditContent(e.target.value)}
                              className="flex-1 rounded-xl border border-primary-500 bg-white px-4 py-2 text-sm dark:bg-gray-700 dark:text-gray-100 focus:outline-none"
                              autoFocus
                              onKeyDown={e => { if (e.key === 'Enter') handleEdit(msg.id); if (e.key === 'Escape') setEditingId(null) }}
                            />
                            <div className="flex gap-1 mt-1">
                              <button onClick={() => handleEdit(msg.id)} className="p-1 text-green-600 hover:bg-green-50 rounded cursor-pointer"><Check className="h-4 w-4" /></button>
                              <button onClick={() => setEditingId(null)} className="p-1 text-gray-500 hover:bg-gray-100 rounded cursor-pointer"><X className="h-4 w-4" /></button>
                            </div>
                          </div>
                        ) : (
                          <div
                            className={`rounded-2xl px-4 py-2.5 text-sm ${
                              isMine
                                ? 'bg-primary-600 text-white rounded-br-sm'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-bl-sm'
                            }`}
                          >
                            <p>{msg.content}</p>
                            <p className={`mt-1 text-xs ${isMine ? 'text-primary-200' : 'text-gray-400'}`}>
                              {formatMessageTime(msg.created_at)}
                            </p>
                          </div>
                        )}
                        {isMine && editingId !== msg.id && (
                          <div className="mt-1 flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => startEdit(msg)} className="p-1 text-gray-400 hover:text-blue-500 rounded cursor-pointer" title="Edit">
                              <Edit2 className="h-3.5 w-3.5" />
                            </button>
                            <button onClick={() => setDeleteTarget({ id: msg.id, show: true })} className="p-1 text-gray-400 hover:text-red-500 rounded cursor-pointer" title="Delete">
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="border-t p-4 dark:border-gray-700">
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder={t('type_message')}
                  className="flex-1 rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }}
                  disabled={sending}
                />
                <Button size="icon" className="rounded-xl" onClick={handleSend} disabled={sending || !newMessage.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageSquare className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600" />
              <h3 className="mt-4 text-lg font-semibold text-gray-500 dark:text-gray-400">{t('select_conversation')}</h3>
              <p className="mt-1 text-sm text-gray-400">{t('select_conversation_description')}</p>
            </div>
          </div>
        )}
      </Card>

      {/* Delete confirmation */}
      <Dialog open={deleteTarget.show} onOpenChange={(open) => !open && setDeleteTarget({ id: '', show: false })}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Message</DialogTitle>
            <DialogDescription>Are you sure you want to delete this message? This cannot be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget({ id: '', show: false })}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function formatMessageTime(dateStr: string) {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  if (diffMin < 1) return 'Just now'
  if (diffMin < 60) return `${diffMin}m ago`
  const diffHrs = Math.floor(diffMin / 60)
  if (diffHrs < 24) return `${diffHrs}h ago`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
