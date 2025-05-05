import React, { useState, useRef } from 'react';
import {
  Box,
  Tag,
  TagLabel,
  TagCloseButton,
  Input,
  IconButton,
  HStack,
  Wrap,
  WrapItem,
  useToast,
} from '@chakra-ui/react';
import { AddIcon } from '@chakra-ui/icons';

interface TaskTagsProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  maxTags?: number;
}

const TaskTags: React.FC<TaskTagsProps> = ({
  tags,
  onChange,
  maxTags = 5,
}) => {
  const [newTag, setNewTag] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const toast = useToast();

  const handleAddTag = () => {
    const trimmedTag = newTag.trim().toLowerCase();

    if (!trimmedTag) {
      return;
    }

    if (tags.includes(trimmedTag)) {
      toast({
        title: 'Hata',
        description: 'Bu etiket zaten eklenmiş',
        status: 'error',
        duration: 2000,
      });
      return;
    }

    if (tags.length >= maxTags) {
      toast({
        title: 'Hata',
        description: `En fazla ${maxTags} etiket ekleyebilirsiniz`,
        status: 'error',
        duration: 2000,
      });
      return;
    }

    onChange([...tags, trimmedTag]);
    setNewTag('');
    inputRef.current?.focus();
  };

  const handleRemoveTag = (tagToRemove: string) => {
    onChange(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  return (
    <Box>
      <HStack mb={3}>
        <Input
          ref={inputRef}
          placeholder="Yeni etiket ekle..."
          value={newTag}
          onChange={(e) => setNewTag(e.target.value)}
          onKeyPress={handleKeyPress}
          maxLength={20}
        />
        <IconButton
          aria-label="Etiket ekle"
          icon={<AddIcon />}
          onClick={handleAddTag}
          isDisabled={!newTag.trim() || tags.length >= maxTags}
        />
      </HStack>

      <Wrap spacing={2}>
        {tags.map((tag) => (
          <WrapItem key={tag}>
            <Tag
              size="md"
              borderRadius="full"
              variant="solid"
              colorScheme="brand"
            >
              <TagLabel>{tag}</TagLabel>
              <TagCloseButton onClick={() => handleRemoveTag(tag)} />
            </Tag>
          </WrapItem>
        ))}
      </Wrap>
    </Box>
  );
};

export default TaskTags; 