import React, { useState, useRef } from 'react';
import {
  VStack,
  HStack,
  Text,
  IconButton,
  Button,
  Input,
  Box,
  useToast,
  Progress,
  Link,
} from '@chakra-ui/react';
import {
  AttachmentIcon,
  DeleteIcon,
  DownloadIcon,
  AddIcon,
} from '@chakra-ui/icons';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { updateDoc, doc } from 'firebase/firestore';
import { storage, db } from '../../config/firebase';
import { TaskAttachment } from '../../types/task';

interface TaskAttachmentsProps {
  taskId: string;
  attachments: TaskAttachment[];
  userId: string;
}

const TaskAttachments: React.FC<TaskAttachmentsProps> = ({
  taskId,
  attachments,
  userId,
}) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const toast = useToast();

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      // Dosya yolu oluştur
      const filePath = `tasks/${taskId}/attachments/${Date.now()}_${file.name}`;
      const storageRef = ref(storage, filePath);

      // Dosyayı yükle
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          // İlerleme durumunu güncelle
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(progress);
        },
        (error) => {
          throw error;
        },
        async () => {
          // Yükleme tamamlandığında
          const downloadURL = await getDownloadURL(storageRef);

          const newAttachment: TaskAttachment = {
            id: Date.now().toString(),
            name: file.name,
            url: downloadURL,
            type: file.type,
            size: file.size,
            uploadedAt: new Date().toISOString(),
            uploadedBy: userId,
          };

          // Firestore'u güncelle
          await updateDoc(doc(db, 'tasks', taskId), {
            attachments: [...attachments, newAttachment],
            updatedAt: new Date().toISOString(),
          });

          toast({
            title: 'Dosya yüklendi',
            status: 'success',
            duration: 3000,
          });

          setUploading(false);
          setUploadProgress(0);
        }
      );
    } catch (error: any) {
      toast({
        title: 'Dosya yüklenemedi',
        description: error.message,
        status: 'error',
        duration: 3000,
      });
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDelete = async (attachment: TaskAttachment) => {
    try {
      // Storage'dan dosyayı sil
      const storageRef = ref(storage, attachment.url);
      await deleteObject(storageRef);

      // Firestore'u güncelle
      const updatedAttachments = attachments.filter((a) => a.id !== attachment.id);
      await updateDoc(doc(db, 'tasks', taskId), {
        attachments: updatedAttachments,
        updatedAt: new Date().toISOString(),
      });

      toast({
        title: 'Dosya silindi',
        status: 'success',
        duration: 3000,
      });
    } catch (error: any) {
      toast({
        title: 'Dosya silinemedi',
        description: error.message,
        status: 'error',
        duration: 3000,
      });
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  return (
    <VStack align="stretch" spacing={4}>
      <HStack justify="space-between">
        <Text fontSize="lg" fontWeight="semibold">
          Ekler ({attachments.length})
        </Text>
        <Button
          leftIcon={<AddIcon />}
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          isLoading={uploading}
        >
          Dosya Ekle
        </Button>
        <Input
          type="file"
          ref={fileInputRef}
          hidden
          onChange={handleFileSelect}
        />
      </HStack>

      {uploading && (
        <Box>
          <Text fontSize="sm" mb={1}>
            Yükleniyor... {uploadProgress.toFixed(0)}%
          </Text>
          <Progress
            value={uploadProgress}
            size="sm"
            colorScheme="brand"
            borderRadius="full"
          />
        </Box>
      )}

      <VStack align="stretch" spacing={2}>
        {attachments.map((attachment) => (
          <HStack
            key={attachment.id}
            p={2}
            borderWidth="1px"
            borderRadius="md"
            spacing={4}
          >
            <AttachmentIcon />
            <VStack align="start" flex={1} spacing={0}>
              <Link href={attachment.url} isExternal color="brand.500">
                {attachment.name}
              </Link>
              <Text fontSize="xs" color="gray.500">
                {formatFileSize(attachment.size)}
              </Text>
            </VStack>
            <HStack>
              <IconButton
                aria-label="İndir"
                icon={<DownloadIcon />}
                size="sm"
                variant="ghost"
                onClick={() => window.open(attachment.url)}
              />
              <IconButton
                aria-label="Sil"
                icon={<DeleteIcon />}
                size="sm"
                variant="ghost"
                colorScheme="red"
                onClick={() => handleDelete(attachment)}
              />
            </HStack>
          </HStack>
        ))}
      </VStack>
    </VStack>
  );
};

export default TaskAttachments; 