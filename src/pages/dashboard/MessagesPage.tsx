import { useState, useEffect, useRef, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/ui/loading'
import { EmptyState } from '@/components/ui/empty-state'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Search, Send, MessageSquare, ChevronLeft, Trash2, Edit2, Check, X, Plus, Paperclip, Smile, CheckCheck, Clock, Image as ImageIcon } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { messageApi } from '@/lib/api'
import { sendMessageNotification } from '@/lib/email'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'
import type { Message, Profile } from '@/types'

interface Conversation {
  userId: string
  name: string
  avatarUrl: string | null
  lastMessage: string
  lastMessageTime: string
  lastMessageTimestamp: number
  unreadCount: number
  lastSenderId: string
  isOnline: boolean
}

export function MessagesPage() {
  const { t } = useTranslation()
  const { user, profile } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [messages, setMessages] = useState<Message[]>([])
  const [activeChatUser, setActiveChatUser] = useState<string | null>(null)
  const [newMessage, setNewMessage] = useState('')
  const [showMobileChat, setShowMobileChat] = useState(false)
  const [sending, setSending] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; show: boolean }>({ id: '', show: false })
  const [searchQuery, setSearchQuery] = useState('')
  const [showNewMessageDialog, setShowNewMessageDialog] = useState(false)
  const [userSearchQuery, setUserSearchQuery] = useState('')
  const [searchedUsers, setSearchedUsers] = useState<Profile[]>([])
  const [searchingUsers, setSearchingUsers] = useState(false)
  const [newConvMessage, setNewConvMessage] = useState('')
  const [selectedNewUser, setSelectedNewUser] = useState<Profile | null>(null)
  const [sendingNewConv, setSendingNewConv] = useState(false)
  const [contactingSupport, setContactingSupport] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const userSearchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

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

  // Handle deep-link: ?to=userId&name=UserName&property=PropertyTitle
  useEffect(() => {
    const toUser = searchParams.get('to')
    const userName = searchParams.get('name')
    const propertyTitle = searchParams.get('property')
    if (toUser && user && toUser !== user.id) {
      setActiveChatUser(toUser)
      setShowMobileChat(true)
      if (propertyTitle) {
        setNewMessage(t('interested_in_property', { property: propertyTitle }))
      }
      // Clear search params after reading
      setSearchParams({}, { replace: true })
    }
  }, [searchParams, user, setSearchParams, t])

  // Real-time subscription
  useEffect(() => {
    if (!user) return
    const channel = supabase
      .channel('messages_realtime')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'messages',
        filter: `sender_id=eq.${user.id}`,
      }, () => fetchMessages())
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'messages',
        filter: `receiver_id=eq.${user.id}`,
      }, () => fetchMessages())
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [user, fetchMessages])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, activeChatUser])

  // Focus input on chat open
  useEffect(() => {
    if (activeChatUser) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [activeChatUser])

  // Search users for new conversation
  const searchUsers = useCallback(async (query: string) => {
    if (!query.trim() || query.trim().length < 2) {
      setSearchedUsers([])
      return
    }
    setSearchingUsers(true)
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .neq('user_id', user?.id || '')
        .or(`full_name.ilike.%${query}%,email.ilike.%${query}%`)
        .limit(10)
      if (error) throw error
      setSearchedUsers((data || []) as unknown as Profile[])
    } catch {
      setSearchedUsers([])
    } finally {
      setSearchingUsers(false)
    }
  }, [user])

  const handleUserSearch = (value: string) => {
    setUserSearchQuery(value)
    if (userSearchTimeout.current) clearTimeout(userSearchTimeout.current)
    userSearchTimeout.current = setTimeout(() => searchUsers(value), 300)
  }

  // Build conversations from messages
  const conversations: Conversation[] = (() => {
    if (!user) return []
    const convMap = new Map<string, Conversation>()
    for (const msg of messages) {
      const otherUserId = msg.sender_id === user.id ? msg.receiver_id : msg.sender_id
      const otherProfile = msg.sender_id === user.id ? msg.receiver : msg.sender
      const existing = convMap.get(otherUserId)
      const isUnread = msg.receiver_id === user.id && !msg.is_read
      const msgTimestamp = new Date(msg.created_at).getTime()
      if (!existing) {
        convMap.set(otherUserId, {
          userId: otherUserId,
          name: otherProfile?.full_name || t('unknown'),
          avatarUrl: otherProfile?.avatar_url || null,
          lastMessage: msg.content,
          lastMessageTime: formatMessageTime(msg.created_at, t),
          lastMessageTimestamp: msgTimestamp,
          unreadCount: isUnread ? 1 : 0,
          lastSenderId: msg.sender_id,
          isOnline: false,
        })
      } else {
        // Messages come sorted descending, so first encountered is the latest
        if (isUnread) existing.unreadCount += 1
      }
    }
    return [...convMap.values()].sort((a, b) => b.lastMessageTimestamp - a.lastMessageTimestamp)
  })()

  // Filter conversations by search
  const filteredConversations = searchQuery.trim()
    ? conversations.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : conversations

  const chatMessages = messages
    .filter(m => {
      if (!activeChatUser) return false
      return (m.sender_id === user?.id && m.receiver_id === activeChatUser) ||
             (m.receiver_id === user?.id && m.sender_id === activeChatUser)
    })
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())

  const activeConversation = conversations.find(c => c.userId === activeChatUser)

  // Build name for deep-linked users not in conversations yet
  const activeChatName = activeConversation?.name || searchParams.get('name') || t('unknown')

  const handleSelectChat = (userId: string) => {
    setActiveChatUser(userId)
    setShowMobileChat(true)
    setEditingId(null)
    // Mark all as read
    const unread = messages.filter(m => m.sender_id === userId && m.receiver_id === user?.id && !m.is_read)
    unread.forEach(m => messageApi.markAsRead(m.id).catch(() => {}))
    // Update local state immediately for better UX
    if (unread.length > 0) {
      setMessages(prev => prev.map(m =>
        m.sender_id === userId && m.receiver_id === user?.id && !m.is_read
          ? { ...m, is_read: true }
          : m
      ))
    }
  }

  const handleSend = async () => {
    if (!newMessage.trim() || !user || !activeChatUser) return
    setSending(true)
    try {
      const data = await messageApi.send({
        sender_id: user.id,
        receiver_id: activeChatUser,
        content: newMessage.trim(),
      } as never)
      setNewMessage('')
      inputRef.current?.focus()
      if (data?.id) sendMessageNotification(data.id)
    } catch {
      toast.error(t('message_send_failed'))
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
      toast.success(t('message_updated'))
    } catch {
      toast.error(t('message_update_failed'))
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget.id) return
    try {
      await messageApi.remove(deleteTarget.id)
      setDeleteTarget({ id: '', show: false })
      toast.success(t('message_deleted'))
    } catch {
      toast.error(t('message_delete_failed'))
    }
  }

  const startEdit = (msg: Message) => {
    setEditingId(msg.id)
    setEditContent(msg.content)
  }

  const handleStartNewConversation = async () => {
    if (!selectedNewUser || !newConvMessage.trim() || !user) return
    setSendingNewConv(true)
    try {
      const data = await messageApi.send({
        sender_id: user.id,
        receiver_id: selectedNewUser.user_id,
        content: newConvMessage.trim(),
      } as never)
      toast.success(t('message_sent'))
      if (data?.id) sendMessageNotification(data.id)
      setShowNewMessageDialog(false)
      setSelectedNewUser(null)
      setNewConvMessage('')
      setUserSearchQuery('')
      setSearchedUsers([])
      // Open the new conversation
      setActiveChatUser(selectedNewUser.user_id)
      setShowMobileChat(true)
    } catch {
      toast.error(t('message_send_failed'))
    } finally {
      setSendingNewConv(false)
    }
  }

  const handleContactSupport = async () => {
    if (!user || !profile) return
    if (profile.role === 'admin' || profile.role === 'super_admin') {
      toast(t('support_staff_message'))
      return
    }
    setContactingSupport(true)
    try {
      const admins = await messageApi.getAdminUsers()
      const admin = admins.find(a => a.user_id !== user.id)
      if (!admin) {
        toast.error(t('no_support_staff'))
        return
      }
      if (conversations.find(c => c.userId === admin.user_id)) {
        handleSelectChat(admin.user_id)
      } else {
        setSelectedNewUser({ ...admin, full_name: admin.full_name || admin.email } as Profile)
        setShowNewMessageDialog(true)
        setNewConvMessage(t('default_support_message'))
      }
    } catch {
      toast.error(t('failed_contact_support'))
    } finally {
      setContactingSupport(false)
    }
  }

  const totalUnread = conversations.reduce((sum, c) => sum + c.unreadCount, 0)

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
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t('messages')}</h2>
                  {totalUnread > 0 && (
                    <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary-600 px-1.5 text-xs text-white font-medium">
                      {totalUnread}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 px-2 text-xs"
                    onClick={handleContactSupport}
                    disabled={contactingSupport}
                    title={t('contact_support')}
                  >
                    <MessageSquare className="h-3.5 w-3.5 mr-1" /> Support
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0"
                    onClick={() => setShowNewMessageDialog(true)}
                    title={t('new_message')}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('search_messages')}
                className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-4 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          {filteredConversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center flex-1 p-4 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-50 dark:bg-primary-900/20">
                <MessageSquare className="h-7 w-7 text-primary-400" />
              </div>
              <p className="mt-4 text-sm font-medium text-gray-900 dark:text-gray-100">
                {searchQuery ? t('no_search_results') : t('no_conversations')}
              </p>
              {!searchQuery && (
                <>
                  <p className="mt-1 text-xs text-gray-500 max-w-[200px]">{t('no_conversations_description')}</p>
                  <div className="mt-4 flex flex-col gap-2 w-full max-w-[200px]">
                    <Button size="sm" className="w-full" onClick={() => setShowNewMessageDialog(true)}>
                      <Plus className="h-4 w-4" /> {t('new_message')}
                    </Button>
                    <Button size="sm" variant="outline" className="w-full" onClick={handleContactSupport} disabled={contactingSupport}>
                      <MessageSquare className="h-4 w-4" /> {t('contact_support')}
                    </Button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto divide-y dark:divide-gray-700">
              {filteredConversations.map((conv) => (
                <button
                  key={conv.userId}
                  onClick={() => handleSelectChat(conv.userId)}
                  className={`flex w-full items-start gap-3 p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer ${
                    activeChatUser === conv.userId ? 'bg-primary-50 dark:bg-primary-900/20 border-l-3 border-l-primary-600' : ''
                  }`}
                >
                  <div className="relative">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-100 text-sm font-bold text-primary-600">
                      {conv.avatarUrl ? (
                        <img src={conv.avatarUrl} alt="" className="h-full w-full rounded-full object-cover" />
                      ) : (
                        conv.name.charAt(0).toUpperCase()
                      )}
                    </div>
                    {conv.isOnline && (
                      <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-green-500 dark:border-gray-900" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className={`text-sm font-medium text-gray-900 dark:text-gray-100 ${conv.unreadCount > 0 ? 'font-semibold' : ''}`}>
                        {conv.name}
                      </span>
                      <span className="text-xs text-gray-500 shrink-0 ml-2">{conv.lastMessageTime}</span>
                    </div>
                    <p className={`truncate text-sm ${conv.unreadCount > 0 ? 'text-gray-700 dark:text-gray-300 font-medium' : 'text-gray-500'}`}>
                      {conv.lastSenderId === user?.id && (
                        <span className="inline-flex items-center gap-0.5 text-primary-500">
                          <CheckCheck className="h-3 w-3" />
                        </span>
                      )}{' '}
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
        {activeChatUser ? (
          <>
            {/* Chat header */}
            <div className="flex items-center justify-between gap-3 border-b p-4 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <button onClick={() => { setShowMobileChat(false); setActiveChatUser(null) }} className="sm:hidden p-1 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <div className="relative">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-100 text-sm font-bold text-primary-600">
                    {activeConversation?.avatarUrl ? (
                      <img src={activeConversation.avatarUrl} alt="" className="h-full w-full rounded-full object-cover" />
                    ) : (
                      (activeConversation?.name || activeChatName).charAt(0).toUpperCase()
                    )}
                  </div>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-gray-100">{activeConversation?.name || activeChatName}</h3>
                  <p className="text-xs text-gray-500">{chatMessages.length} {t('messages').toLowerCase()}</p>
                </div>
              </div>
            </div>

            {/* Messages area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {chatMessages.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-50 dark:bg-primary-900/20">
                    <MessageSquare className="h-8 w-8 text-primary-400" />
                  </div>
                  <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                    {t('start_conversation_hint')}
                  </p>
                </div>
              ) : (
                <>
                  {/* Date separator helper */}
                  {chatMessages.map((msg, index) => {
                    const isMine = msg.sender_id === user?.id
                    const showDate = index === 0 || formatDateSeparator(msg.created_at, t) !== formatDateSeparator(chatMessages[index - 1].created_at, t)
                    return (
                      <div key={msg.id}>
                        {showDate && (
                          <div className="flex items-center justify-center my-4">
                            <div className="h-px flex-1 bg-gray-200 dark:bg-gray-700" />
                            <span className="px-3 text-xs text-gray-400 font-medium">
                              {formatDateSeparator(msg.created_at, t)}
                            </span>
                            <div className="h-px flex-1 bg-gray-200 dark:bg-gray-700" />
                          </div>
                        )}
                        <div className={`group flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                          <div className="max-w-[80%] sm:max-w-[70%]">
                            {editingId === msg.id ? (
                              <div className="flex gap-2 items-start">
                                <input
                                  type="text"
                                  value={editContent}
                                  onChange={e => setEditContent(e.target.value)}
                                  className="flex-1 rounded-xl border border-primary-500 bg-white px-4 py-2 text-sm dark:bg-gray-700 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                                  autoFocus
                                  onKeyDown={e => { if (e.key === 'Enter') handleEdit(msg.id); if (e.key === 'Escape') setEditingId(null) }}
                                />
                                <div className="flex gap-1 mt-1">
                                  <button onClick={() => handleEdit(msg.id)} className="p-1.5 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30 rounded-lg cursor-pointer transition-colors" title={t('save')}>
                                    <Check className="h-4 w-4" />
                                  </button>
                                  <button onClick={() => setEditingId(null)} className="p-1.5 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg cursor-pointer transition-colors" title={t('cancel')}>
                                    <X className="h-4 w-4" />
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div
                                className={`rounded-2xl px-4 py-2.5 text-sm shadow-sm ${
                                  isMine
                                    ? 'bg-primary-600 text-white rounded-br-md'
                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-bl-md'
                                }`}
                              >
                                <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                                <div className={`mt-1 flex items-center gap-1 text-xs ${isMine ? 'text-primary-200 justify-end' : 'text-gray-400'}`}>
                                  <span>{formatChatTime(msg.created_at)}</span>
                                  {isMine && (
                                    msg.is_read
                                      ? <CheckCheck className="h-3 w-3 text-primary-200" />
                                      : <Clock className="h-3 w-3 text-primary-300" />
                                  )}
                                </div>
                              </div>
                            )}
                            {isMine && editingId !== msg.id && (
                              <div className="mt-1 flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => startEdit(msg)} className="p-1 text-gray-400 hover:text-blue-500 rounded cursor-pointer transition-colors" title={t('edit')}>
                                  <Edit2 className="h-3.5 w-3.5" />
                                </button>
                                <button onClick={() => setDeleteTarget({ id: msg.id, show: true })} className="p-1 text-gray-400 hover:text-red-500 rounded cursor-pointer transition-colors" title={t('delete')}>
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message input */}
            <div className="border-t p-4 dark:border-gray-700">
              <div className="flex items-end gap-2">
                <div className="flex-1 relative">
                  <input
                    ref={inputRef}
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder={t('type_message')}
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 pr-10 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }}
                    disabled={sending}
                  />
                </div>
                <Button
                  size="icon"
                  className="rounded-xl h-10 w-10 shrink-0"
                  onClick={handleSend}
                  disabled={sending || !newMessage.trim()}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gray-50 dark:bg-gray-800">
                <MessageSquare className="h-10 w-10 text-gray-300 dark:text-gray-600" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-gray-500 dark:text-gray-400">{t('select_conversation')}</h3>
              <p className="mt-1 text-sm text-gray-400 max-w-xs mx-auto">{t('select_conversation_description')}</p>
              <Button
                className="mt-4"
                variant="outline"
                onClick={() => setShowNewMessageDialog(true)}
              >
                <Plus className="h-4 w-4" />
                {t('new_message')}
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Delete confirmation dialog */}
      <Dialog open={deleteTarget.show} onOpenChange={(open) => !open && setDeleteTarget({ id: '', show: false })}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t('delete_message')}</DialogTitle>
            <DialogDescription>{t('delete_message_confirm')}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget({ id: '', show: false })}>{t('cancel')}</Button>
            <Button variant="destructive" onClick={handleDelete}>{t('delete')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New message dialog */}
      <Dialog open={showNewMessageDialog} onOpenChange={(open) => {
        if (!open) {
          setShowNewMessageDialog(false)
          setSelectedNewUser(null)
          setNewConvMessage('')
          setUserSearchQuery('')
          setSearchedUsers([])
        }
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t('new_message')}</DialogTitle>
            <DialogDescription>{t('new_message_description')}</DialogDescription>
          </DialogHeader>

          {!selectedNewUser ? (
            <div className="space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={userSearchQuery}
                  onChange={(e) => handleUserSearch(e.target.value)}
                  placeholder={t('search_users')}
                  className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  autoFocus
                />
              </div>
              <div className="max-h-60 overflow-y-auto">
                {searchingUsers ? (
                  <div className="flex items-center justify-center py-8">
                    <LoadingSpinner />
                  </div>
                ) : searchedUsers.length === 0 ? (
                  <div className="py-8 text-center text-sm text-gray-500">
                    {userSearchQuery.trim().length >= 2
                      ? t('no_users_found')
                      : t('type_to_search')}
                  </div>
                ) : (
                  <div className="divide-y dark:divide-gray-700">
                    {searchedUsers.map((u) => (
                      <button
                        key={u.user_id}
                        onClick={() => {
                          // Check if conversation already exists
                          const existing = conversations.find(c => c.userId === u.user_id)
                          if (existing) {
                            setShowNewMessageDialog(false)
                            handleSelectChat(u.user_id)
                            setSelectedNewUser(null)
                            setUserSearchQuery('')
                            setSearchedUsers([])
                          } else {
                            setSelectedNewUser(u)
                          }
                        }}
                        className="flex w-full items-center gap-3 p-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-lg transition-colors cursor-pointer"
                      >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-100 text-sm font-bold text-primary-600">
                          {u.avatar_url ? (
                            <img src={u.avatar_url} alt="" className="h-full w-full rounded-full object-cover" />
                          ) : (
                            u.full_name?.charAt(0)?.toUpperCase() || 'U'
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{u.full_name}</p>
                          <p className="text-xs text-gray-500 truncate">{u.email} • <span className="capitalize">{u.role}</span></p>
                        </div>
                        {conversations.find(c => c.userId === u.user_id) && (
                          <span className="text-xs text-primary-600 bg-primary-50 dark:bg-primary-900/30 px-2 py-0.5 rounded-full">
                            {t('existing')}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-3 rounded-lg border border-gray-200 dark:border-gray-700 p-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-100 text-sm font-bold text-primary-600">
                  {selectedNewUser.avatar_url ? (
                    <img src={selectedNewUser.avatar_url} alt="" className="h-full w-full rounded-full object-cover" />
                  ) : (
                    selectedNewUser.full_name?.charAt(0)?.toUpperCase() || 'U'
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{selectedNewUser.full_name}</p>
                  <p className="text-xs text-gray-500">{selectedNewUser.email}</p>
                </div>
                <button onClick={() => setSelectedNewUser(null)} className="p-1 text-gray-400 hover:text-gray-600 cursor-pointer">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <textarea
                value={newConvMessage}
                onChange={(e) => setNewConvMessage(e.target.value)}
                placeholder={t('type_your_message')}
                rows={3}
                className="w-full rounded-lg border border-gray-300 bg-white p-3 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                autoFocus
              />
              <DialogFooter>
                <Button variant="outline" onClick={() => setSelectedNewUser(null)}>{t('back')}</Button>
                <Button
                  onClick={handleStartNewConversation}
                  disabled={sendingNewConv || !newConvMessage.trim()}
                  loading={sendingNewConv}
                >
                  <Send className="h-4 w-4" />
                  {t('send_message')}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

function formatMessageTime(dateStr: string, t: (key: string, options?: Record<string, unknown>) => string) {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  if (diffMin < 1) return t('just_now')
  if (diffMin < 60) return `${diffMin}${t('m_ago')}`
  const diffHrs = Math.floor(diffMin / 60)
  if (diffHrs < 24) return `${diffHrs}${t('h_ago')}`
  const diffDays = Math.floor(diffHrs / 24)
  if (diffDays < 7) return `${diffDays}${t('d_ago')}`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function formatChatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  })
}

function formatDateSeparator(dateStr: string, t: (key: string, options?: Record<string, unknown>) => string) {
  const date = new Date(dateStr)
  const now = new Date()
  const diffDays = Math.floor((now.getTime() - date.getTime()) / 86400000)
  if (diffDays === 0) return t('today')
  if (diffDays === 1) return t('yesterday')
  return date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })
}
