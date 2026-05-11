import { Bot, User, Loader2 } from "lucide-react";
import { UIMessage } from "ai";

interface MessageListProps {
  messages: any[];
  status: string;
  scrollRef: React.RefObject<HTMLDivElement | null>;
}

export const MessageList = ({ messages, status, scrollRef }: MessageListProps) => {
  console.log("t",status)
  // if(!messages||messages?.length===0) {
  //   return <div className="py-42 flex items-center justify-center text-muted-foreground font-medium">Ask a Question</div>
  // }
  return (
    <div className="flex-1 overflow-y-auto p-4" ref={scrollRef as any}>
      <div className="flex flex-col gap-4 pb-4 w-full md:max-w-3/4 mx-auto">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-center text-muted-foreground pt-20">
            <Bot className="h-12 w-12 mb-4 opacity-50 text-primary" />
            <p>No messages yet. Ask a question about this document!</p>
          </div>
        )}
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex gap-3 max-w-[80%] ${
              m.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
            }`}
          >
            <div
              className={`${(status=="streaming"||status=="error"||status=="submitted")&&"hidden"}flex items-center justify-center h-8 w-8 rounded-full shrink-0 py-2 px-2 ${
                m.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              }`}
            >
              {m.role === "user" ? <User size={16} /> : <Bot className={`${(status=="streaming"||status=="submitted")&&"animate-pulse"}`} size={16} />}
            </div>
            <div
              className={` break-words px-4 py-3 rounded-2xl whitespace-pre-wrap text-sm shadow-sm ${
                m.role === "user"
                  ? "bg-primary text-primary-foreground rounded-tr-sm"
                  : "bg-muted text-foreground rounded-tl-sm border"
              }`}
            >
              {
                m.content?<span>{m.content}</span>:((m.parts)&&m.parts.map((c:any,i:number) => (
               <span key={i+Math.random()}>{c.type === "text" ? c.text : null}</span>
              )))
              }
              
            </div>
          </div>
        ))}
        {status === "streaming" && messages[messages.length - 1]?.role === "user" && (
          <div className="flex gap-3 max-w-[80%] mr-auto">
            <div className="flex items-center justify-center h-8 w-8 rounded-full shrink-0 bg-muted text-muted-foreground">
              <Bot size={16} />
            </div>
            <div className="px-4 py-3 rounded-2xl bg-muted text-foreground rounded-tl-sm border flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
              <span className="text-sm">Thinking...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
