'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';
import { chatlogAPI } from '@/libs/ChatlogAPI';

export function SessionList() {
  const [format, setFormat] = useState<'json' | 'text'>('text');

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['sessions', format],
    queryFn: () => chatlogAPI.getSessions({ format }),
    enabled: false,
  });

  const handleQuery = () => {
    refetch();
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col space-y-4">
        <div>
          <p className="text-sm text-muted-foreground mb-4">
            查询最近会话列表。
            <Badge variant="secondary" className="ml-2">
              GET /api/v1/session
            </Badge>
          </p>
        </div>

        <div className="flex gap-2">
          <Button onClick={handleQuery} disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            查询会话
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
                data.items.map((session, index) => (
                  <div
                    key={index}
                    className="p-4 border rounded-lg hover:bg-accent transition-colors"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="font-medium">{session.nickName || session.userName}</div>
                      <div className="text-sm text-muted-foreground">{session.nTime}</div>
                    </div>
                    <div className="text-sm text-muted-foreground line-clamp-2">
                      {session.content}
                    </div>
                    {session.nUnReadCount > 0 && (
                      <Badge variant="destructive" className="mt-2">
                        {session.nUnReadCount} 条未读
                      </Badge>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-center text-muted-foreground py-8">暂无会话</p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
