import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { ChevronUp, ChevronDown, Reply, Calendar } from 'lucide-react';
import { ForumComment } from '@shared/schema';

interface CommentThreadProps {
  topicId: number;
  comments: ForumComment[];
}

interface CommentItemProps {
  comment: ForumComment;
  topicId: number;
  level?: number;
}

function CommentItem({ comment, topicId, level = 0 }: CommentItemProps) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const voteMutation = useMutation({
    mutationFn: async ({ voteType }: { voteType: number }) => {
      return apiRequest('POST', `/api/forum/comments/${comment.id}/vote`, { voteType });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/forum/topics', topicId, 'comments'] });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao votar',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const replyMutation = useMutation({
    mutationFn: async (content: string) => {
      return apiRequest('POST', '/api/forum/comments', {
        content,
        topicId,
        parentId: comment.id,
      });
    },
    onSuccess: () => {
      setReplyContent('');
      setShowReplyForm(false);
      queryClient.invalidateQueries({ queryKey: ['/api/forum/topics', topicId, 'comments'] });
      toast({
        title: 'Resposta adicionada!',
        description: 'Sua resposta foi publicada com sucesso.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao responder',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleVote = (voteType: number) => {
    voteMutation.mutate({ voteType });
  };

  const handleReply = () => {
    if (replyContent.trim()) {
      replyMutation.mutate(replyContent);
    }
  };

  return (
    <div className={`${level > 0 ? 'ml-8 border-l-2 border-gray-200 pl-4' : ''}`}>
      <Card className="mb-4">
        <CardHeader className="pb-3">
          <div className="flex items-start space-x-3">
            <Avatar className="w-8 h-8">
              <AvatarImage src="" />
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <span className="font-medium text-sm">Usuário</span>
                <div className="flex items-center text-xs text-gray-500">
                  <Calendar className="w-3 h-3 mr-1" />
                  {new Date(comment.createdAt).toLocaleDateString('pt-BR')}
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="prose prose-sm max-w-none mb-4">
            <p>{comment.content}</p>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Vote buttons */}
            <div className="flex items-center space-x-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleVote(1)}
                disabled={voteMutation.isPending}
                className="p-1 h-auto"
              >
                <ChevronUp className="w-4 h-4" />
              </Button>
              <span className="text-sm font-medium">{comment.votes || 0}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleVote(-1)}
                disabled={voteMutation.isPending}
                className="p-1 h-auto"
              >
                <ChevronDown className="w-4 h-4" />
              </Button>
            </div>

            {/* Reply button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowReplyForm(!showReplyForm)}
              className="flex items-center space-x-1"
            >
              <Reply className="w-4 h-4" />
              <span>Responder</span>
            </Button>
          </div>

          {/* Reply form */}
          {showReplyForm && (
            <div className="mt-4 space-y-3">
              <Textarea
                placeholder="Escreva sua resposta..."
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                rows={3}
              />
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowReplyForm(false)}
                >
                  Cancelar
                </Button>
                <Button
                  size="sm"
                  onClick={handleReply}
                  disabled={replyMutation.isPending || !replyContent.trim()}
                >
                  {replyMutation.isPending ? 'Enviando...' : 'Responder'}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export function CommentThread({ topicId, comments }: CommentThreadProps) {
  const [newComment, setNewComment] = useState('');
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const commentMutation = useMutation({
    mutationFn: async (content: string) => {
      return apiRequest('POST', '/api/forum/comments', {
        content,
        topicId,
      });
    },
    onSuccess: () => {
      setNewComment('');
      queryClient.invalidateQueries({ queryKey: ['/api/forum/topics', topicId, 'comments'] });
      toast({
        title: 'Comentário adicionado!',
        description: 'Seu comentário foi publicado com sucesso.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao comentar',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleAddComment = () => {
    if (newComment.trim()) {
      commentMutation.mutate(newComment);
    }
  };

  // Organize comments in a tree structure
  const topLevelComments = comments.filter(comment => !comment.parentId);
  const replies = comments.filter(comment => comment.parentId);

  const getCommentWithReplies = (comment: ForumComment): ForumComment & { replies: ForumComment[] } => {
    const commentReplies = replies.filter(reply => reply.parentId === comment.id);
    return { ...comment, replies: commentReplies };
  };

  return (
    <div className="space-y-6">
      {/* Add new comment */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Adicionar Comentário</h3>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Compartilhe sua opinião ou faça uma pergunta..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            rows={4}
          />
          <div className="flex justify-end">
            <Button
              onClick={handleAddComment}
              disabled={commentMutation.isPending || !newComment.trim()}
            >
              {commentMutation.isPending ? 'Enviando...' : 'Comentar'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Comments list */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">
          Comentários ({comments.length})
        </h3>
        
        {comments.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-gray-500">
                Seja o primeiro a comentar nesta discussão!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div>
            {topLevelComments.map((comment) => {
              const commentWithReplies = getCommentWithReplies(comment);
              return (
                <div key={comment.id}>
                  <CommentItem comment={comment} topicId={topicId} />
                  {commentWithReplies.replies.map((reply) => (
                    <CommentItem 
                      key={reply.id} 
                      comment={reply} 
                      topicId={topicId} 
                      level={1} 
                    />
                  ))}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
