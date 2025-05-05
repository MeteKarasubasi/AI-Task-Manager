import React, { useState, useRef } from 'react';
import { Box, Button, Text, VStack, HStack, useToast, Spinner } from '@chakra-ui/react';
import { FaMicrophone, FaStop, FaTrash, FaCheck } from 'react-icons/fa';
import { whisperService } from '../services/ai/whisperService';
import { geminiService } from '../services/ai/geminiService';

interface VoiceRecorderProps {
  onTaskCreate: (task: any) => void;
}

/**
 * Ses kaydı almak ve metne çevirmek için kullanılan bileşen
 * Whisper API ve Gemini API entegrasyonuyla ses kaydını göreve dönüştürür
 */
const VoiceRecorder: React.FC<VoiceRecorderProps> = ({ onTaskCreate }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [transcription, setTranscription] = useState('');
  const [suggestedTask, setSuggestedTask] = useState<any>(null);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const toast = useToast();

  // Kayıt başlatma
  const startRecording = async () => {
    try {
      audioChunksRef.current = [];
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(audioBlob);
        
        // Ses kaydını metne çevir
        transcribeAudio(audioBlob);
      };
      
      mediaRecorder.start();
      setIsRecording(true);
      
      toast({
        title: "Kayıt başladı",
        description: "Görev bilgilerinizi sesli olarak anlatabilirsiniz.",
        status: "info",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Ses kaydı başlatılırken hata:', error);
      toast({
        title: "Hata",
        description: "Ses kaydı başlatılamadı. Mikrofon izni verdiğinizden emin olun.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // Kayıt durdurma
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      // Medya akışını durdur
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      
      toast({
        title: "Kayıt tamamlandı",
        description: "Ses kaydınız analiz ediliyor...",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Ses kaydını iptal etme
  const cancelRecording = () => {
    setAudioBlob(null);
    setTranscription('');
    setSuggestedTask(null);
    
    toast({
      title: "İptal edildi",
      description: "Ses kaydı iptal edildi.",
      status: "info",
      duration: 2000,
      isClosable: true,
    });
  };

  // Ses kaydını metne çevirme (Whisper API)
  const transcribeAudio = async (blob: Blob) => {
    try {
      setIsTranscribing(true);
      const text = await whisperService.transcribeAudio(blob);
      setTranscription(text);
      
      // Metni analiz et ve görev önerisi oluştur
      if (text) {
        analyzeTranscription(text);
      }
    } catch (error) {
      console.error('Ses metne çevrilirken hata:', error);
      toast({
        title: "Hata",
        description: "Ses dosyası metne çevrilirken bir sorun oluştu.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsTranscribing(false);
    }
  };

  // Metni analiz etme ve görev önerisi oluşturma (Gemini API)
  const analyzeTranscription = async (text: string) => {
    try {
      setIsAnalyzing(true);
      const taskSuggestion = await geminiService.analyzeVoiceInput(text);
      setSuggestedTask(taskSuggestion);
    } catch (error) {
      console.error('Ses girdisi analiz edilirken hata:', error);
      toast({
        title: "Hata",
        description: "Ses girdisi analiz edilirken bir sorun oluştu.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Önerilen görevi kabul etme
  const acceptSuggestedTask = () => {
    if (suggestedTask) {
      onTaskCreate(suggestedTask);
      
      toast({
        title: "Görev oluşturuldu",
        description: "Sesinizden oluşturulan görev başarıyla eklendi.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      
      // Durumu sıfırla
      setAudioBlob(null);
      setTranscription('');
      setSuggestedTask(null);
    }
  };

  return (
    <Box borderWidth="1px" borderRadius="lg" p={4} bg="white" shadow="sm">
      <VStack spacing={4} align="stretch">
        <Text fontWeight="bold" fontSize="lg">Sesli Görev Oluşturma</Text>
        
        {!isRecording && !audioBlob && (
          <Button 
            leftIcon={<FaMicrophone />}
            colorScheme="blue"
            onClick={startRecording}
            size="lg"
            width="full"
          >
            Kayda Başla
          </Button>
        )}
        
        {isRecording && (
          <Button 
            leftIcon={<FaStop />}
            colorScheme="red"
            onClick={stopRecording}
            size="lg"
            width="full"
            isLoading={isRecording}
            loadingText="Kaydediliyor..."
          >
            Kaydı Durdur
          </Button>
        )}
        
        {isTranscribing && (
          <Box textAlign="center" py={3}>
            <Spinner size="md" color="blue.500" mr={2} />
            <Text>Ses metne çevriliyor...</Text>
          </Box>
        )}
        
        {transcription && (
          <Box borderWidth="1px" borderRadius="md" p={3} bg="gray.50">
            <Text fontWeight="medium" mb={1}>Metne Çevrilen Ses:</Text>
            <Text>{transcription}</Text>
          </Box>
        )}
        
        {isAnalyzing && (
          <Box textAlign="center" py={3}>
            <Spinner size="md" color="purple.500" mr={2} />
            <Text>Görev analiz ediliyor...</Text>
          </Box>
        )}
        
        {suggestedTask && (
          <Box borderWidth="1px" borderRadius="md" p={4} bg="purple.50">
            <Text fontWeight="medium" mb={2}>Önerilen Görev:</Text>
            <VStack align="start" spacing={2}>
              <Text fontWeight="bold">{suggestedTask.title}</Text>
              <Text fontSize="sm">{suggestedTask.description}</Text>
              <HStack>
                <Text fontSize="xs" fontWeight="medium">Öncelik:</Text>
                <Box 
                  px={2} 
                  py={1} 
                  borderRadius="full" 
                  bg={
                    suggestedTask.priority === 'high' ? 'red.100' :
                    suggestedTask.priority === 'medium' ? 'yellow.100' : 'green.100'
                  }
                  fontSize="xs"
                >
                  {suggestedTask.priority === 'high' ? 'Yüksek' :
                   suggestedTask.priority === 'medium' ? 'Orta' : 'Düşük'}
                </Box>
              </HStack>
            </VStack>
            
            <HStack mt={4} spacing={2}>
              <Button 
                leftIcon={<FaCheck />} 
                colorScheme="green" 
                size="sm"
                onClick={acceptSuggestedTask}
                flex="1"
              >
                Kabul Et
              </Button>
              <Button 
                leftIcon={<FaTrash />} 
                colorScheme="red" 
                variant="outline"
                size="sm"
                onClick={cancelRecording}
                flex="1"
              >
                İptal Et
              </Button>
            </HStack>
          </Box>
        )}
      </VStack>
    </Box>
  );
};

export default VoiceRecorder; 