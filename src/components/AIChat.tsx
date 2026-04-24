import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Bot, User, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface AIChatProps {
  clusterData?: any;
}

export const AIChat = ({ clusterData }: AIChatProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hello! I'm your Urban Climate Advisor AI. Ask me anything about Urban Heat Islands, mitigation strategies, or climate data analysis.",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: input };
    const currentInput = input.trim();
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // Try backend API first, fallback to Supabase if available
      const API_BASE = "http://127.0.0.1:8000";
      let response;
      
      try {
        response = await fetch(`${API_BASE}/ai-advisor/chat`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            prompt: currentInput,
          }),
        });
      } catch (backendError: any) {
        // If backend fetch fails, try Supabase fallback
        if (import.meta.env.VITE_SUPABASE_URL) {
          try {
            response = await fetch(
              `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/gemini-climate-advisor`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
                },
                body: JSON.stringify({
                  messages: [...messages, userMessage],
                  clusterData,
                }),
              }
            );
          } catch (supabaseError) {
            throw new Error("Both backend and Supabase are unavailable");
          }
        } else {
          throw backendError;
        }
      }

      // Check if response was successfully obtained
      if (!response) {
        throw new Error("No response from server");
      }

      if (!response.ok) {
        if (response.status === 429) {
          toast({
            title: "Rate Limit Exceeded",
            description: "Too many requests. Please try again later.",
            variant: "destructive",
          });
          return;
        }
        if (response.status === 402) {
          toast({
            title: "Credits Exhausted",
            description: "AI credits depleted. Please add credits to continue.",
            variant: "destructive",
          });
          return;
        }
        throw new Error("Failed to get response");
      }

      // Handle both streaming (Supabase) and non-streaming (backend) responses
      const contentType = response.headers.get("content-type");
      
      if (contentType?.includes("stream") || contentType?.includes("text/event-stream")) {
        // Streaming response (Supabase)
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let assistantMessage = "";

        if (reader) {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value);
            const lines = chunk.split("\n");

            for (const line of lines) {
              if (line.startsWith("data: ")) {
                const data = line.slice(6);
                if (data === "[DONE]") continue;

                try {
                  const parsed = JSON.parse(data);
                  const content = parsed.choices?.[0]?.delta?.content;
                  if (content) {
                    assistantMessage += content;
                    setMessages((prev) => {
                      const newMessages = [...prev];
                      if (newMessages[newMessages.length - 1]?.role === "assistant") {
                        newMessages[newMessages.length - 1].content = assistantMessage;
                      } else {
                        newMessages.push({ role: "assistant", content: assistantMessage });
                      }
                      return newMessages;
                    });
                  }
                } catch (e) {
                  // Ignore JSON parse errors for incomplete chunks
                }
              }
            }
          }
        }
      } else {
        // Non-streaming response (backend API)
        try {
          const data = await response.json();
          const assistantMessage = data.response || data.message || "I'm sorry, I couldn't generate a response.";
          setMessages((prev) => [...prev, { role: "assistant", content: assistantMessage }]);
        } catch (jsonError) {
          // If JSON parsing fails, try to get text response
          const textResponse = await response.text();
          setMessages((prev) => [...prev, { role: "assistant", content: textResponse || "I'm sorry, I couldn't generate a response." }]);
        }
      }
    } catch (error: any) {
      console.error("Error sending message:", error);
      const errorMessage = error?.message || "Failed to send message";
      toast({
        title: "Error",
        description: errorMessage.includes("fetch") 
          ? "Cannot connect to backend. Please ensure the server is running on http://127.0.0.1:8000"
          : errorMessage,
        variant: "destructive",
      });
      // Add error message to chat
      setMessages((prev) => [...prev, { 
        role: "assistant", 
        content: "I apologize, but I'm having trouble connecting to the AI service. Please check that the backend server is running and try again." 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="flex flex-col h-[600px] bg-gradient-to-br from-card to-muted/20 border-primary/20">
      <div className="p-4 border-b border-border bg-primary/5">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary rounded-lg">
            <Bot className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Climate Advisor AI</h3>
            <p className="text-xs text-muted-foreground">Powered by Gemini</p>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message, idx) => (
            <div
              key={idx}
              className={`flex gap-3 ${
                message.role === "assistant" ? "justify-start" : "justify-end"
              }`}
            >
              {message.role === "assistant" && (
                <div className="p-2 bg-primary/10 rounded-full h-8 w-8 flex items-center justify-center flex-shrink-0">
                  <Bot className="h-4 w-4 text-primary" />
                </div>
              )}
              <div
                className={`max-w-[80%] p-3 rounded-lg ${
                  message.role === "assistant"
                    ? "bg-card border border-border"
                    : "bg-primary text-primary-foreground"
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              </div>
              {message.role === "user" && (
                <div className="p-2 bg-accent/10 rounded-full h-8 w-8 flex items-center justify-center flex-shrink-0">
                  <User className="h-4 w-4 text-accent" />
                </div>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-3 justify-start">
              <div className="p-2 bg-primary/10 rounded-full h-8 w-8 flex items-center justify-center">
                <Loader2 className="h-4 w-4 text-primary animate-spin" />
              </div>
              <div className="bg-card border border-border p-3 rounded-lg">
                <p className="text-sm text-muted-foreground">AI is thinking...</p>
              </div>
            </div>
          )}
          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      <div className="p-4 border-t border-border bg-card">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Ask about UHI mitigation strategies..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button
            onClick={sendMessage}
            disabled={isLoading || !input.trim()}
            className="bg-primary hover:bg-primary-dark"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </Card>
  );
};
