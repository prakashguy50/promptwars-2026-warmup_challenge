import React, { useState, useRef } from 'react';
import { Mic, Camera, Send, Loader2, Square } from 'lucide-react';
import { compressImage, blobToBase64 } from '../utils/media';

interface EmergencyInterfaceProps {
  onSubmit: (text: string, audioBase64?: string, imageBase64?: string) => Promise<void>;
  isLoading: boolean;
}

export default function EmergencyInterface({ onSubmit, isLoading }: EmergencyInterfaceProps) {
  const [text, setText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const startRecording = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Error accessing microphone:', err);
      setError('Microphone access denied or unavailable.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handlePhotoCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setError(null);
      const compressedBase64 = await compressImage(file);
      setImageBase64(compressedBase64);
      setImagePreview(URL.createObjectURL(file));
    } catch (err) {
      console.error('Error processing image:', err);
      setError('Failed to process image.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text && !audioBlob && !imageBase64) {
      setError('Please provide text, audio, or a photo.');
      return;
    }

    try {
      setError(null);
      let audioBase64Str = undefined;
      if (audioBlob) {
        audioBase64Str = await blobToBase64(audioBlob);
      }
      await onSubmit(text, audioBase64Str, imageBase64 || undefined);
    } catch (err) {
      console.error('Submit error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred during submission.');
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-4 flex flex-col gap-6">
      <div className="text-center mb-4">
        <h1 className="text-3xl font-bold text-red-500 mb-2">SankatBridge</h1>
        <p className="text-zinc-400">Emergency Response System</p>
      </div>

      {error && (
        <div className="bg-red-900/50 border border-red-500 text-red-200 p-4 rounded-lg" role="alert">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <button
          type="button"
          onClick={isRecording ? stopRecording : startRecording}
          disabled={isLoading}
          aria-label={isRecording ? "Stop recording audio" : "Start recording audio"}
          className={`flex flex-col items-center justify-center p-6 rounded-2xl transition-colors min-h-[120px] ${
            isRecording 
              ? 'bg-red-600 hover:bg-red-700 text-white animate-pulse' 
              : audioBlob 
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-100'
          }`}
        >
          {isRecording ? <Square size={48} className="mb-2" /> : <Mic size={48} className="mb-2" />}
          <span className="font-semibold text-lg">
            {isRecording ? 'Stop' : audioBlob ? 'Recorded' : 'Hold to Speak'}
          </span>
        </button>

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isLoading}
          aria-label="Take a photo"
          className={`flex flex-col items-center justify-center p-6 rounded-2xl transition-colors min-h-[120px] ${
            imagePreview 
              ? 'bg-green-600 hover:bg-green-700 text-white' 
              : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-100'
          }`}
        >
          <Camera size={48} className="mb-2" />
          <span className="font-semibold text-lg">
            {imagePreview ? 'Photo Added' : 'Take Photo'}
          </span>
        </button>
        <input
          type="file"
          accept="image/*"
          capture="environment"
          ref={fileInputRef}
          onChange={handlePhotoCapture}
          className="hidden"
          aria-hidden="true"
        />
      </div>

      {imagePreview && (
        <div className="relative w-full h-48 rounded-lg overflow-hidden border border-zinc-700">
          <img src={imagePreview} alt="Captured emergency" className="w-full h-full object-cover" />
          <button 
            onClick={() => { setImagePreview(null); setImageBase64(null); }}
            className="absolute top-2 right-2 bg-black/70 text-white p-2 rounded-full"
            aria-label="Remove photo"
          >
            ✕
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label htmlFor="emergency-text" className="sr-only">Describe the emergency</label>
        <textarea
          id="emergency-text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={isLoading}
          placeholder="Or type what happened..."
          className="w-full bg-zinc-800 border border-zinc-700 rounded-xl p-4 text-zinc-100 placeholder-zinc-500 focus:ring-2 focus:ring-red-500 focus:border-transparent min-h-[120px] resize-none text-lg"
        />

        <button
          type="submit"
          disabled={isLoading || (!text && !audioBlob && !imageBase64)}
          className="w-full bg-red-600 hover:bg-red-700 disabled:bg-zinc-800 disabled:text-zinc-500 text-white font-bold text-xl py-5 rounded-xl flex items-center justify-center gap-3 transition-colors"
          aria-label="Send Emergency Report"
        >
          {isLoading ? (
            <>
              <Loader2 className="animate-spin" size={28} />
              Analyzing...
            </>
          ) : (
            <>
              <Send size={28} />
              SEND REPORT
            </>
          )}
        </button>
      </form>
    </div>
  );
}
