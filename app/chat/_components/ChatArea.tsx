"use client";

import { useChat } from "@ai-sdk/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, User, Bot, Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { DefaultChatTransport } from "ai";
import { ChatInput } from "./ChatInput";
import { MessageList } from "./MessageList";

interface ChatAreaProps {
  documentId: string;
  conversationId: string;
  initialMessages: any[];
}

export const ChatArea = ({ documentId, conversationId, initialMessages }: ChatAreaProps) => {
  const [input,setInput]=useState("")
  const { messages, sendMessage,status, } = useChat({
    id:conversationId,
    messages:initialMessages,
    transport: new DefaultChatTransport({
       api: "/api/chat",
       prepareSendMessagesRequest({messages, id}){
        return{
          body:{
            selectedDocumentId: documentId,
           conversationId,
            message:messages[messages.length-1],
            id
          }
        }

       }
    })   
   
  });

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit=(e:React.FormEvent)=>{
    if(!input.trim()) return;
    e.preventDefault()
    sendMessage({text:input.trim()})
    setInput("")

  }
console.log("messages",messages)
  return (
    <div>
   <MessageList 
     messages={messages}
     status={status}
     scrollRef={scrollRef}
   />

  
   <ChatInput 
        input={input} 
        handleInputChange={setInput} 
        handleSubmit={handleSubmit} 
        status={status} 
      /> 
       </div>
  );
};
