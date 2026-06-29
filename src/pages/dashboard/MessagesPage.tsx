import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/ui/loading'
import { EmptyState } from '@/components/ui/empty-state'
import { Search, Send, MessageSquare, ChevronLeft } from 'lucide-react'

interface Conversation {
  id: string
  name: string
  lastMessage: string
  time: string
  unread: boolean
}

interface Message {
  id: string
  content: string
  sender: 'me' | 'them'
  time: string
}

const mockConversations: Conversation[] = [
  { id: '1', name: 'Alice Mutesi', lastMessage: 'Is the apartment still available?', time: '2m ago', unread: true },
  { id: '2', name: 'Jean-Pierre K.', lastMessage: 'Yes, you can schedule a visit.', time: '1h ago', unread: false },
  { id: '3', name: 'Diane Uwimana', lastMessage: 'The rent includes water and electricity?', time: '3h ago', unread: true },
  { id: '4', name: 'Patrick Habimana', lastMessage: 'Thank you for the tour!', time: '1d ago', unread: false },
]

const mockMessages: Message[] = [
  { id: '1', content: 'Hello! Is the property still available?', sender: 'me', time: '10:30 AM' },
  { id: '2', content: 'Yes, it is still available. Would you like to schedule a visit?', sender: 'them', time: '10:32 AM' },
  { id: '3', content: 'Yes, I would love to see it this weekend.', sender: 'me', time: '10:35 AM' },
  { id: '4', content: 'Great! Saturday at 10 AM works for me.', sender: 'them', time: '10:36 AM' },
]

export function MessagesPage() {
  const { t } = useTranslation()
  const [loading, setLoading] = useState(true)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeChat, setActiveChat] = useState<string | null>(null)
  const [newMessage, setNewMessage] = useState('')
  const [showMobileChat, setShowMobileChat] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setConversations(mockConversations)
      setLoading(false)
    }, 600)
    return () => clearTimeout(timer)
  }, [])

  const activeConversation = conversations.find((c) => c.id === activeChat)

  const handleSelectChat = (id: string) => {
    setActiveChat(id)
    setShowMobileChat(true)
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-4">
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

          {loading ? (
            <LoadingSpinner />
          ) : conversations.length === 0 ? (
            <EmptyState icon={MessageSquare} title={t('no_conversations')} description={t('no_conversations_description')} />
          ) : (
            <div className="flex-1 overflow-y-auto divide-y dark:divide-gray-700">
              {conversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => handleSelectChat(conv.id)}
                  className={`flex w-full items-start gap-3 p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer ${
                    activeChat === conv.id ? 'bg-primary-50 dark:bg-primary-900/20' : ''
                  }`}
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-100 text-sm font-bold text-primary-600">
                    {conv.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{conv.name}</span>
                      <span className="text-xs text-gray-500">{conv.time}</span>
                    </div>
                    <p className="truncate text-sm text-gray-500">{conv.lastMessage}</p>
                  </div>
                  {conv.unread && <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary-600" />}
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className={`flex-1 flex flex-col ${!showMobileChat ? 'hidden sm:flex' : 'flex'}`}>
        {activeChat && activeConversation ? (
          <>
            <div className="flex items-center gap-3 border-b p-4 dark:border-gray-700">
              <button onClick={() => setShowMobileChat(false)} className="sm:hidden p-1 cursor-pointer">
                <ChevronLeft className="h-5 w-5" />
              </button>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 text-sm font-bold text-primary-600">
                {activeConversation.name.charAt(0)}
              </div>
              <div>
                <h3 className="font-medium text-gray-900 dark:text-gray-100">{activeConversation.name}</h3>
                <p className="text-xs text-green-600">{t('online')}</p>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {mockMessages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[80%] sm:max-w-[70%] rounded-2xl px-4 py-2.5 text-sm ${
                      msg.sender === 'me'
                        ? 'bg-primary-600 text-white rounded-br-sm'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-bl-sm'
                    }`}
                  >
                    <p>{msg.content}</p>
                    <p className={`mt-1 text-xs ${msg.sender === 'me' ? 'text-primary-200' : 'text-gray-400'}`}>{msg.time}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t p-4 dark:border-gray-700">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder={t('type_message')}
                  className="flex-1 rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  onKeyDown={(e) => e.key === 'Enter' && setNewMessage('')}
                />
                <Button size="icon" className="rounded-xl">
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
    </div>
  )
}
