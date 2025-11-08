'use client';

import { useAtom } from 'jotai';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SessionList } from './SessionList';
import { ChatRoomList } from './ChatRoomList';
import { ContactList } from './ContactList';
import { ChatlogViewer } from './ChatlogViewer';
import { activeTabAtom } from '@/stores/chatlogStore';

export function ChatlogDashboard() {
  const [activeTab, setActiveTab] = useAtom(activeTabAtom);

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold mb-4">🎉 Chatlog 服务已成功启动</h1>
        <p className="text-muted-foreground">
          Chatlog 是一个帮助你轻松使用自己聊天数据的工具，现在你可以通过 HTTP API 访问你的聊天记录、联系人和群聊信息。
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>🔍 API 接口与调试</CardTitle>
          <CardDescription>
            使用下面的选项卡来查询你的聊天数据
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as typeof activeTab)} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="session">最近会话</TabsTrigger>
              <TabsTrigger value="chatroom">群聊</TabsTrigger>
              <TabsTrigger value="contact">联系人</TabsTrigger>
              <TabsTrigger value="chatlog">聊天记录</TabsTrigger>
            </TabsList>

            <TabsContent value="session" className="mt-6">
              <SessionList />
            </TabsContent>

            <TabsContent value="chatroom" className="mt-6">
              <ChatRoomList />
            </TabsContent>

            <TabsContent value="contact" className="mt-6">
              <ContactList />
            </TabsContent>

            <TabsContent value="chatlog" className="mt-6">
              <ChatlogViewer />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
