'use client';

import { useAtom } from 'jotai';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { SessionList } from './SessionList';
import { ChatRoomList } from './ChatRoomList';
import { ContactList } from './ContactList';
import { ChatlogViewer } from './ChatlogViewer';
import { activeTabAtom } from '@/stores/chatlogStore';
import { MessageCircle, Users, UserCircle, MessageSquare } from 'lucide-react';

export function ChatlogDashboard() {
  const [activeTab, setActiveTab] = useAtom(activeTabAtom);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-purple-950">
      <div className="container mx-auto py-6 px-4 md:py-12 md:px-6">
        {/* Hero Section */}
        <div className="mb-8 md:mb-12 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white text-sm font-medium shadow-lg shadow-pink-500/30">
            <MessageCircle className="w-4 h-4" />
            <span>服务运行中</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
            欢迎使用 Lovchat
          </h1>

          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
            你的专属聊天助手，让珍贵的对话永不丢失
          </p>
        </div>

        {/* Main Content */}
        <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 border-0 shadow-2xl">
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as typeof activeTab)} className="w-full">
            <div className="border-b bg-gradient-to-r from-pink-50 to-purple-50 dark:from-gray-800 dark:to-purple-900/20">
              <TabsList className="w-full h-auto bg-transparent grid grid-cols-2 md:grid-cols-4 gap-2 p-4">
                <TabsTrigger
                  value="session"
                  className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:shadow-md data-[state=active]:text-pink-600 dark:data-[state=active]:text-pink-400 rounded-lg py-3"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span className="hidden sm:inline">最近会话</span>
                  <span className="sm:hidden">会话</span>
                </TabsTrigger>

                <TabsTrigger
                  value="chatroom"
                  className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:shadow-md data-[state=active]:text-purple-600 dark:data-[state=active]:text-purple-400 rounded-lg py-3"
                >
                  <Users className="w-4 h-4" />
                  <span className="hidden sm:inline">群聊</span>
                  <span className="sm:hidden">群聊</span>
                </TabsTrigger>

                <TabsTrigger
                  value="contact"
                  className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:shadow-md data-[state=active]:text-pink-600 dark:data-[state=active]:text-pink-400 rounded-lg py-3"
                >
                  <UserCircle className="w-4 h-4" />
                  <span className="hidden sm:inline">联系人</span>
                  <span className="sm:hidden">联系人</span>
                </TabsTrigger>

                <TabsTrigger
                  value="chatlog"
                  className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:shadow-md data-[state=active]:text-purple-600 dark:data-[state=active]:text-purple-400 rounded-lg py-3"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span className="hidden sm:inline">聊天记录</span>
                  <span className="sm:hidden">记录</span>
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="p-4 md:p-6">
              <TabsContent value="session" className="mt-0">
                <SessionList />
              </TabsContent>

              <TabsContent value="chatroom" className="mt-0">
                <ChatRoomList />
              </TabsContent>

              <TabsContent value="contact" className="mt-0">
                <ContactList />
              </TabsContent>

              <TabsContent value="chatlog" className="mt-0">
                <ChatlogViewer />
              </TabsContent>
            </div>
          </Tabs>
        </Card>

        {/* Footer Hint */}
        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">
            Lovchat 已为您准备就绪 • 所有数据仅存储在本地
          </p>
        </div>
      </div>
    </div>
  );
}
