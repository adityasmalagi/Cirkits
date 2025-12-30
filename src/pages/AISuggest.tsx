import { useState, useRef, useEffect, useMemo } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sparkles, Send, User, Bot, Loader2, LogIn, MousePointerClick } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface SuggestionOption {
  number: string;
  title: string;
  fullText: string;
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-suggest`;

// Parse AI response to extract numbered options
const parseOptions = (content: string): SuggestionOption[] => {
  const options: SuggestionOption[] = [];
  
  // Match patterns like "1. **Title**" or "Option 1:" with following description
  const lines = content.split('\n');
  let currentOption: SuggestionOption | null = null;
  
  for (const line of lines) {
    // Match numbered options: "1.", "1)", "Option 1:", "**1.**", etc.
    const optionMatch = line.match(/^(?:\*\*)?(?:Option\s+)?(\d)[.):]\s*(?:\*\*)?\s*(.+?)(?:\*\*)?$/i);
    
    if (optionMatch) {
      if (currentOption) {
        options.push(currentOption);
      }
      currentOption = {
        number: optionMatch[1],
        title: optionMatch[2].replace(/\*\*/g, '').replace(/:$/, '').trim(),
        fullText: `Option ${optionMatch[1]}: ${optionMatch[2].replace(/\*\*/g, '').trim()}`,
      };
    } else if (currentOption && line.trim() && !line.match(/^(?:\*\*)?(?:Option\s+)?\d[.):]/)) {
      // Append description lines to current option
      currentOption.fullText += ' ' + line.trim();
    }
  }
  
  if (currentOption) {
    options.push(currentOption);
  }
  
  return options.slice(0, 4); // Max 4 options
};

export default function AISuggest() {
  const { user, isLoading: authLoading } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async (messageText?: string) => {
    const textToSend = messageText || input.trim();
    if (!textToSend || isLoading) return;

    const userMessage: Message = { role: 'user', content: textToSend };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    let assistantContent = '';

    try {
      // Get the user's session token for authentication
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        toast.error('Please sign in to use the AI assistant');
        setMessages(prev => prev.slice(0, -1));
        setIsLoading(false);
        return;
      }

      const response = await fetch(CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ messages: [...messages, userMessage] }),
      });

      if (!response.ok) {
        const error = await response.json();
        if (response.status === 401) {
          toast.error('Please sign in to use the AI assistant');
          throw new Error('Please sign in to continue');
        }
        if (response.status === 429) {
          toast.error('Rate limit exceeded. Please try again later.');
        }
        if (response.status === 402) {
          toast.error('AI credits exhausted. Please try again later.');
        }
        throw new Error(error.error || 'Failed to get AI response');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) throw new Error('No response body');

      // Add empty assistant message
      setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = buffer.indexOf('\n')) !== -1) {
          let line = buffer.slice(0, newlineIndex);
          buffer = buffer.slice(newlineIndex + 1);

          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (line.startsWith(':') || line.trim() === '') continue;
          if (!line.startsWith('data: ')) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') continue;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              assistantContent += content;
              setMessages(prev => {
                const updated = [...prev];
                updated[updated.length - 1] = { role: 'assistant', content: assistantContent };
                return updated;
              });
            }
          } catch {
            // Incomplete JSON, wait for more data
          }
        }
      }
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [
        ...prev.slice(0, -1),
        { role: 'assistant', content: `Sorry, I encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.` }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleOptionClick = (optionText: string) => {
    sendMessage(`I choose ${optionText}. Please give me more details about this option.`);
  };

  // Get the last assistant message to check for options
  const lastAssistantMessage = useMemo(() => {
    const assistantMessages = messages.filter(m => m.role === 'assistant');
    return assistantMessages[assistantMessages.length - 1];
  }, [messages]);

  const parsedOptions = useMemo(() => {
    if (!lastAssistantMessage || isLoading) return [];
    return parseOptions(lastAssistantMessage.content);
  }, [lastAssistantMessage, isLoading]);

  return (
    <Layout>
      <div className="container py-8 max-w-4xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <Sparkles className="h-4 w-4" />
            AI-Powered Recommendations
          </div>
          <h1 className="text-3xl font-bold mb-2">Cirkit AI Assistant</h1>
          <p className="text-muted-foreground">
            Describe your project idea and I'll recommend the perfect hardware and components for your build
          </p>
        </div>

        <Card className="h-[60vh] flex flex-col">
          <ScrollArea className="flex-1 p-4" ref={scrollRef}>
            {!user && !authLoading ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8">
                <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
                  <LogIn className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Sign in to use AI Assistant</h3>
                <p className="text-muted-foreground text-sm max-w-md mb-6">
                  Please sign in to access the AI-powered hardware recommendation assistant.
                </p>
                <Button asChild className="gradient-primary text-primary-foreground">
                  <Link to="/auth">
                    <LogIn className="h-4 w-4 mr-2" />
                    Sign In
                  </Link>
                </Button>
              </div>
            ) : messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8">
                <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center mb-4">
                  <Bot className="h-8 w-8 text-primary-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">How can I help you today?</h3>
                <p className="text-muted-foreground text-sm max-w-md mb-6">
                  Tell me about the project you want to build, your budget, and experience level. I'll suggest the perfect components and projects for you.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg">
                  {[
                    "Smart home automation under ₹10,000",
                    "Arduino plant watering for beginners",
                    "Best laptop for programming ₹80K",
                    "AI security camera with Jetson Nano",
                  ].map((suggestion) => (
                    <Button
                      key={suggestion}
                      variant="outline"
                      size="sm"
                      className="text-left h-auto py-3 px-4 text-sm whitespace-normal leading-tight"
                      onClick={() => {
                        setInput(suggestion);
                      }}
                    >
                      {suggestion}
                    </Button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={cn(
                      'flex gap-3',
                      message.role === 'user' ? 'justify-end' : 'justify-start'
                    )}
                  >
                    {message.role === 'assistant' && (
                      <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center flex-shrink-0">
                        <Bot className="h-4 w-4 text-primary-foreground" />
                      </div>
                    )}
                    <div
                      className={cn(
                        'max-w-[80%] rounded-xl px-4 py-3',
                        message.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      )}
                    >
                      <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">
                        {message.content || (isLoading && index === messages.length - 1 ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : null)}
                      </div>
                    </div>
                    {message.role === 'user' && (
                      <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
                        <User className="h-4 w-4" />
                      </div>
                    )}
                  </div>
                ))}
                
                {/* Clickable option buttons after last assistant message */}
                {parsedOptions.length > 0 && !isLoading && (
                  <div className="flex gap-3 justify-start">
                    <div className="w-8 h-8 flex-shrink-0" /> {/* Spacer for alignment */}
                    <div className="space-y-2 w-full max-w-[80%]">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                        <MousePointerClick className="h-3 w-3" />
                        Click an option to learn more
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {parsedOptions.map((option) => (
                          <Button
                            key={option.number}
                            variant="outline"
                            size="sm"
                            className="text-left h-auto py-3 px-4 justify-start hover:bg-primary/10 hover:border-primary transition-colors"
                            onClick={() => handleOptionClick(option.title)}
                          >
                            <span className="flex items-center gap-2">
                              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 text-primary text-xs font-bold flex items-center justify-center">
                                {option.number}
                              </span>
                              <span className="text-sm font-medium line-clamp-2">{option.title}</span>
                            </span>
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </ScrollArea>

          <CardContent className="p-4 border-t">
            <div className="flex gap-2">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Describe your project or ask for recommendations..."
                className="min-h-[60px] resize-none"
                disabled={isLoading}
              />
              <Button
                onClick={() => sendMessage()}
                disabled={!input.trim() || isLoading || !user}
                className="gradient-primary text-primary-foreground px-4"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
