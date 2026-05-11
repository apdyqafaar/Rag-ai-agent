import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, Loader2 } from "lucide-react";
import { ChangeEvent, FormEvent } from "react";

interface ChatInputProps {
  input: string;
  handleInputChange: (e:string) => void;
  handleSubmit: (e: FormEvent<HTMLFormElement>) => void;
  status: string;
}

export const ChatInput = ({ input, handleInputChange, handleSubmit, status }: ChatInputProps) => {
  return (
    <div className="p-4 bg-background border-t sticky bottom-0 w-full">
      <form
        onSubmit={handleSubmit}
        className="flex w-full items-center space-x-2 max-w-3xl mx-auto"
      >
        <Input
          value={input}
          onChange={(e)=>handleInputChange(e.target.value)}
          placeholder="Ask a question about your document..."
          className="flex-1 rounded-full px-6 py-6 shadow-sm border-2 focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary"
          disabled={status === "streaming"}
        />
        <Button
          type="submit"
          size="icon"
          className="rounded-full shrink-0 h-12 w-12 shadow-sm transition-transform active:scale-95"
          disabled={status === "streaming" || !input.trim()}
        >
          {status === "streaming" ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Send className="h-5 w-5" />
          )}
          <span className="sr-only">Send message</span>
        </Button>
      </form>
    </div>
  );
};
