import React, { useState } from 'react';
import { Box, Button, Textarea, Text, VStack, Heading, Divider, List, ListItem, ListIcon, Spinner, useToast } from '@chakra-ui/react';
import { FaClipboardCheck, FaPlus } from 'react-icons/fa';
import { geminiService } from '../services/ai/geminiService';

interface MeetingNotesSummarizerProps {
  onTasksCreate: (tasks: any[]) => void;
}

/**
 * Toplantı notlarını özetleyen ve aksiyon maddelerine dönüştüren bileşen
 * Gemini API entegrasyonuyla çalışır
 */
const MeetingNotesSummarizer: React.FC<MeetingNotesSummarizerProps> = ({ onTasksCreate }) => {
  const [notes, setNotes] = useState('');
  const [summary, setSummary] = useState<string[]>([]);
  const [actionItems, setActionItems] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  
  const toast = useToast();

  // Toplantı notlarını özetleme
  const handleSummarize = async () => {
    if (!notes.trim()) {
      toast({
        title: "Girdi eksik",
        description: "Lütfen toplantı notlarını girin.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      setIsProcessing(true);
      setError('');
      
      // Gemini API ile notları özetle
      const result = await geminiService.summarizeMeetingNotes(notes);
      
      setSummary(result.summary);
      setActionItems(result.actionItems);
      
      toast({
        title: "Özet tamamlandı",
        description: "Toplantı notları başarıyla özetlendi.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Notlar özetlenirken hata:', error);
      setError('Toplantı notları özetlenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
      
      toast({
        title: "Hata",
        description: "Notlar özetlenirken bir sorun oluştu.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Aksiyon maddelerini görev olarak ekleme
  const handleAddActionItemsAsTasks = () => {
    if (actionItems.length === 0) {
      toast({
        title: "Aksiyon maddesi bulunamadı",
        description: "Eklenecek aksiyon maddesi bulunamadı.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    // Aksiyon maddelerini görev listesine ekle
    onTasksCreate(actionItems);
    
    toast({
      title: "Görevler eklendi",
      description: `${actionItems.length} aksiyon maddesi görev olarak eklendi.`,
      status: "success",
      duration: 3000,
      isClosable: true,
    });
  };
  
  return (
    <Box borderWidth="1px" borderRadius="lg" p={5} bg="white" shadow="md">
      <VStack spacing={5} align="stretch">
        <Heading size="md">Toplantı Notları Özetleyici</Heading>
        
        <Box>
          <Text mb={2} fontWeight="medium">Notları Girin</Text>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Toplantı notlarını buraya girin..."
            size="md"
            rows={8}
            resize="vertical"
          />
        </Box>
        
        <Button
          colorScheme="blue"
          isLoading={isProcessing}
          loadingText="İşleniyor..."
          onClick={handleSummarize}
          leftIcon={<FaClipboardCheck />}
        >
          Özetle ve Aksiyon Maddeleri Çıkar
        </Button>
        
        {isProcessing && (
          <Box textAlign="center" py={3}>
            <Spinner size="md" color="blue.500" />
            <Text mt={2}>Notlar işleniyor...</Text>
            <Text fontSize="sm" color="gray.500">
              Bu işlem birkaç saniye sürebilir
            </Text>
          </Box>
        )}
        
        {error && (
          <Box p={3} bg="red.50" borderRadius="md" color="red.600">
            <Text>{error}</Text>
          </Box>
        )}
        
        {summary.length > 0 && (
          <Box>
            <Heading size="sm" mb={2}>Özet</Heading>
            <Box p={3} bg="gray.50" borderRadius="md">
              {summary.map((item, index) => (
                <Text key={index} mb={2}>{item}</Text>
              ))}
            </Box>
          </Box>
        )}
        
        {actionItems.length > 0 && (
          <Box>
            <Heading size="sm" mb={2}>Aksiyon Maddeleri</Heading>
            <List spacing={3}>
              {actionItems.map((item, index) => (
                <ListItem 
                  key={index} 
                  p={3} 
                  borderWidth="1px" 
                  borderRadius="md"
                  borderLeftWidth="4px"
                  borderLeftColor={
                    item.priority === 'high' ? 'red.400' :
                    item.priority === 'medium' ? 'yellow.400' : 'green.400'
                  }
                >
                  <Text fontWeight="bold">{item.title}</Text>
                  <Text fontSize="sm" mt={1}>{item.description}</Text>
                  <Text 
                    fontSize="xs" 
                    mt={2} 
                    color={
                      item.priority === 'high' ? 'red.600' :
                      item.priority === 'medium' ? 'yellow.600' : 'green.600'
                    }
                    fontWeight="medium"
                  >
                    {item.priority === 'high' ? 'Yüksek Öncelikli' :
                     item.priority === 'medium' ? 'Orta Öncelikli' : 'Düşük Öncelikli'}
                  </Text>
                </ListItem>
              ))}
            </List>
            
            <Button
              mt={4}
              colorScheme="green"
              onClick={handleAddActionItemsAsTasks}
              leftIcon={<FaPlus />}
              size="md"
              width="full"
            >
              Aksiyon Maddelerini Görev Olarak Ekle
            </Button>
          </Box>
        )}
      </VStack>
    </Box>
  );
};

export default MeetingNotesSummarizer; 