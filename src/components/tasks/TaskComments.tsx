import React, { useState } from 'react';
import {
  VStack,
  HStack,
  Text,
  Avatar,
  Button,
  Textarea,
  Box,
  useToast,
  Divider,
} from '@chakra-ui/react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { updateDoc, doc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { TaskComment } from '../../types/task';

interface TaskCommentsProps {
  taskId: string;
  comments: TaskComment[];
  user: {
    uid: string;
    displayName: string | null;
    photoURL: string | null;
  };
}

const TaskComments: React.FC<TaskCommentsProps> = ({
  taskId,
  comments,
  user,
}) => {
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const toast = useToast();

  const handleSubmit = async () => {
    if (!newComment.trim()) return;

    setSubmitting(true);

    try {
      const comment: TaskComment = {
        id: Date.now().toString(),
        userId: user.uid,
        userDisplayName: user.displayName || 'İsimsiz Kullanıcı',
        userPhotoURL: user.photoURL,
        content: newComment.trim(),
        createdAt: new Date().toISOString(),
      };

      await updateDoc(doc(db, 'tasks', taskId), {
        comments: [...comments, comment],
        updatedAt: new Date().toISOString(),
      });

      setNewComment('');
      toast({
        title: 'Yorum eklendi',
        status: 'success',
        duration: 3000,
      });
    } catch (error: any) {
      toast({
        title: 'Yorum eklenemedi',
        description: error.message,
        status: 'error',
        duration: 3000,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    try {
      const updatedComments = comments.filter((c) => c.id !== commentId);
      await updateDoc(doc(db, 'tasks', taskId), {
        comments: updatedComments,
        updatedAt: new Date().toISOString(),
      });

      toast({
        title: 'Yorum silindi',
        status: 'success',
        duration: 3000,
      });
    } catch (error: any) {
      toast({
        title: 'Yorum silinemedi',
        description: error.message,
        status: 'error',
        duration: 3000,
      });
    }
  };

  return (
    <VStack align="stretch" spacing={4}>
      <Text fontSize="lg" fontWeight="semibold">
        Yorumlar ({comments.length})
      </Text>

      {/* Yorum Listesi */}
      <VStack align="stretch" spacing={4}>
        {comments.map((comment) => (
          <Box key={comment.id} p={4} borderWidth="1px" borderRadius="md">
            <HStack spacing={4} align="start">
              <Avatar
                size="sm"
                name={comment.userDisplayName}
                src={comment.userPhotoURL || undefined}
              />
              <VStack align="stretch" flex={1} spacing={1}>
                <HStack justify="space-between">
                  <Text fontWeight="medium">{comment.userDisplayName}</Text>
                  <Text fontSize="sm" color="gray.500">
                    {format(new Date(comment.createdAt), 'dd MMM yyyy HH:mm', {
                      locale: tr,
                    })}
                  </Text>
                </HStack>
                <Text>{comment.content}</Text>
                {comment.userId === user.uid && (
                  <Button
                    size="xs"
                    colorScheme="red"
                    variant="ghost"
                    alignSelf="flex-end"
                    onClick={() => handleDelete(comment.id)}
                  >
                    Sil
                  </Button>
                )}
              </VStack>
            </HStack>
          </Box>
        ))}
      </VStack>

      <Divider />

      {/* Yeni Yorum Formu */}
      <VStack align="stretch" spacing={2}>
        <Textarea
          placeholder="Yorum yaz..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          rows={3}
        />
        <Button
          alignSelf="flex-end"
          colorScheme="brand"
          isLoading={submitting}
          onClick={handleSubmit}
          isDisabled={!newComment.trim()}
        >
          Gönder
        </Button>
      </VStack>
    </VStack>
  );
};

export default TaskComments; 