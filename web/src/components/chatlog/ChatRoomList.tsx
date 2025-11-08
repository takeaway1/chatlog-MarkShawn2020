'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Users } from 'lucide-react';
import { chatlogAPI } from '@/libs/ChatlogAPI';

export function ChatRoomList() {
  const [keyword, setKeyword] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['chatrooms', searchKeyword],
    queryFn: () =>
      chatlogAPI.getChatRooms({
        keyword: searchKeyword || undefined,
        format: 'json',
      }),
    enabled: false,
  });

  const handleQuery = () => {
    setSearchKeyword(keyword);
    refetch();
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col space-y-4">
        <div>
          <p className="text-sm text-muted-foreground mb-4">
            查询群聊列表,可选择性地按关键词搜索。
            <Badge variant="secondary" className="ml-2">
              GET /api/v1/chatroom
            </Badge>
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="chatroom-keyword">
            搜索群聊
            <span className="text-xs text-muted-foreground ml-2">(可选)</span>
          </Label>
          <Input
            id="chatroom-keyword"
            placeholder="输入关键词搜索群聊"
            value={keyword}
            onChange={e => setKeyword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleQuery()}
          />
        </div>

        <div className="flex gap-2">
          <Button onClick={handleQuery} disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            查询群聊
          </Button>
        </div>
      </div>

      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive">
              错误: {error instanceof Error ? error.message : '未知错误'}
            </p>
          </CardContent>
        </Card>
      )}

      {data && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              {data.items && data.items.length > 0 ? (
                data.items.map((chatroom, index) => (
                  <div
                    key={index}
                    className="p-4 border rounded-lg hover:bg-accent transition-colors"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="font-medium">{chatroom.nickName || chatroom.name}</div>
                      <Badge variant="outline" className="ml-2">
                        <Users className="mr-1 h-3 w-3" />
                        {chatroom.users?.length || 0} 人
                      </Badge>
                    </div>
                    {chatroom.remark && (
                      <div className="text-sm text-muted-foreground mb-1">备注: {chatroom.remark}</div>
                    )}
                    {chatroom.owner && (
                      <div className="text-xs text-muted-foreground">群主: {chatroom.owner}</div>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-center text-muted-foreground py-8">暂无群聊</p>
              )}
            </div>
            {data.total > 0 && (
              <div className="mt-4 text-sm text-muted-foreground text-center">
                共 {data.total} 个群聊
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
