import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

function NoteSection({ userId, programId }: { userId?: string; programId: string }) {
  const [noteText, setNoteText] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const { toast } = useToast();

  const { data: existingNote } = useQuery({
    queryKey: ['/api/reflection-notes', userId, programId],
    queryFn: () => fetch(`/api/reflection-notes/${userId}/${programId}`).then(res => res.json()),
    enabled: !!userId,
  });

  useEffect(() => {
    if (existingNote?.noteText) {
      setNoteText(existingNote.noteText);
    }
  }, [existingNote]);

  const saveNoteMutation = useMutation({
    mutationFn: (noteData: { userId: string; programId: string; noteText: string }) =>
      apiRequest('POST', '/api/reflection-notes', noteData),
    onSuccess: () => {
      toast({
        title: "Note Saved!",
        description: "Your reflection note has been saved successfully.",
      });
      setSaveMessage("✓ Saved");
      setTimeout(() => setSaveMessage(""), 2000);
      
      queryClient.invalidateQueries({ queryKey: ['/api/reflection-notes', userId, programId] });
    },
    onError: () => {
      toast({
        title: "Save Failed",
        description: "Failed to save your note. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    if (!userId) {
      toast({
        title: "Please log in",
        description: "You need to be logged in to save notes.",
        variant: "destructive",
      });
      return;
    }

    if (!noteText.trim()) {
      toast({
        title: "Nothing to save",
        description: "Please write something before saving.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    saveNoteMutation.mutate({
      userId,
      programId,
      noteText: noteText.trim(),
    });
    setIsSaving(false);
  };

  return (
    <div className="bg-white border-2 rounded-lg p-6" style={{borderColor: '#f3a8cb'}}>
      <h4 className="font-bold text-pink-500 text-lg mb-4">WRITE YOURSELF A NOTE</h4>
      <p className="text-gray-700 mb-4">Use this space to write down a message to your body or future self.</p>
      
      <textarea
        value={noteText}
        onChange={(e) => setNoteText(e.target.value)}
        className="w-full h-32 p-4 border-2 border-gray-200 rounded-lg resize-none focus:border-pink-400 focus:outline-none"
        placeholder="Dear body, thank you for..."
        style={{
          fontSize: '14px',
          lineHeight: '1.5',
          fontFamily: 'inherit'
        }}
        data-testid="reflection-note-textarea"
      />
      
      <div className="mt-4 flex justify-between items-center">
        <div className="text-sm text-gray-500">
          {saveMessage && (
            <span className="text-green-600 font-medium">{saveMessage}</span>
          )}
        </div>
        <Button
          onClick={handleSave}
          disabled={isSaving || saveNoteMutation.isPending}
          className="bg-pink-500 hover:bg-pink-600 text-white px-6 py-2 rounded-lg font-medium"
          data-testid="save-note-button"
        >
          {isSaving || saveNoteMutation.isPending ? 'Saving...' : 'Save Note'}
        </Button>
      </div>
    </div>
  );
}

export default NoteSection;
