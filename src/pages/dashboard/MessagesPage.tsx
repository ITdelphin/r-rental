import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, Send } from 'lucide-react'

const mockConversations = [
  { id: '1', name: 'Alice Mutesi', lastMessage: 'Is the apartment still available?', time: '2m ago', unread: true },
  { id: '2', name: 'Jean-Pierre K.', lastMessage: 'Yes, you can schedule a visit.', time: '1h ago', unread: false },
  { id: '3', name: 'Diane Uwimana', lastMessage: 'The rent includes water and electricity?', time: '3h ago', unread: true },
]

const messages = [
  { id: '1', content: 'Hello! Is the property still available?', sender: 'me', time: '10:30 AM' },
  { id: '2', content: 'Yes, it is still available. Would you like to schedule a visit?', sender: 'them', time: '10:32 AM' },
  { id: '3', content: 'Yes, I would love to see it this weekend.', sender: 'me', time: '10:35 AM' },
  { id: '4', content: 'Great! Saturday at 10 AM works for me.', sender: 'them', time: '10:36 AM' },
]

export function MessagesPage() {
  const { t } = useTranslation()
  const [activeChat, setActiveChat] = useState('1')
  const [newMessage, setNewMessage] = useState('')

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-4">
      <Card className="w-80 flex-shrink-0 hidden sm:block">
        <CardContent className="p-0">
          <div className="border-b p-3 dark:border-gray-700">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input type="text" placeholder="Search messages..." className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-4 text-sm dark:border-gray-600 dark:bg-gray-800" />
            </div>
          </div>
          <div className="divide-y dark:divide-gray-700">
            {mockConversations.map((conv) => (
              <button key={conv.id} onClick={() => setActiveChat(conv.id)} className={`flex w-full items-start gap-3 p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer ${activeChat === conv.id ? 'bg-primary-50 dark:bg-primary-900/20' : ''}`}>
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-100 text-sm font-bold text-primary-600">{conv.name.charAt(0)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{conv.name}</span>
                    <span className="text-xs text-gray-500">{conv.time}</span>
                  </div>
                  <p className="truncate text-sm text-gray-500">{conv.lastMessage}</p>
                </div>
                {conv.unread && <div className="h-2 w-2 rounded-full bg-primary-600" />}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
      <Card className="flex-1 flex flex-col">
        <div className="border-b p-4 dark:border-gray-700">
          <h3 className="font-medium text-gray-900 dark:text-gray-100">Alice Mutesi</h3>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[70%] rounded-lg px-4 py-2 text-sm ${msg.sender === 'me' ? 'bg-primary-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100'}`}>
                <p>{msg.content}</p>
                <p className={`mt-1 text-xs ${msg.sender === 'me' ? 'text-primary-200' : 'text-gray-400'}`}>{msg.time}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="border-t p-4 dark:border-gray-700">
          <div className="flex gap-2">
            <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Type a message..." className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm dark:border-gray-600 dark:bg-gray-800" />
            <Button size="icon"><Send className="h-4 w-4" /></Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
