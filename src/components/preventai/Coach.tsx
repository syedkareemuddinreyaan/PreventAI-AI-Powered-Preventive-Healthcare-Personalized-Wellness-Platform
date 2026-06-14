import { useEffect, useMemo } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { HeartPulse, Sparkles, RefreshCw, Bot } from "lucide-react";
import ReactMarkdown from "react-markdown";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { Message, MessageContent } from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputTextarea,
  PromptInputFooter,
  PromptInputSubmit,
  type PromptInputMessage,
} from "@/components/ai-elements/prompt-input";
import { Shimmer } from "@/components/ai-elements/shimmer";
import { Button } from "@/components/ui/button";
import { loadReport } from "@/lib/preventai/store";
import { buildCoachContext } from "@/lib/preventai/coach-context";
import { toast } from "sonner";

const STORAGE_KEY = "preventai:coach:messages:v1";

function loadStored(): UIMessage[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? (arr as UIMessage[]) : [];
  } catch {
    return [];
  }
}

const SUGGESTIONS = [
  "Why is my heart risk medium?",
  "Build me a quick gym warm-up.",
  "Best foods to lower diabetes risk?",
  "How can I sleep 7+ hours consistently?",
];

export function Coach() {
  const report = useMemo(() => loadReport(), []);
  const context = useMemo(() => buildCoachContext(report), [report]);
  const initial = useMemo(loadStored, []);

  const transport = useMemo(
    () => new DefaultChatTransport({ api: "/api/chat", body: { context } }),
    [context],
  );

  const { messages, sendMessage, status, setMessages } = useChat({
    id: "preventai-coach",
    messages: initial,
    transport,
    onError: (e) => toast.error(e.message || "AI Coach error"),
  });

  // Persist on every change
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch { /* ignore quota */ }
  }, [messages]);

  // Keep textarea focused after sends / stream
  useEffect(() => {
    if (status === "ready") {
      document.querySelector<HTMLTextAreaElement>("textarea[placeholder]")?.focus();
    }
  }, [status]);

  const isBusy = status === "submitted" || status === "streaming";

  const handleSubmit = async (m: PromptInputMessage) => {
    const text = (m.text || "").trim();
    if (!text || isBusy) return;
    await sendMessage({ text });
  };

  const reset = () => {
    setMessages([]);
    if (typeof window !== "undefined") localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <div className="glass flex h-[calc(100vh-12rem)] min-h-[560px] flex-col overflow-hidden rounded-3xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/60 px-5 py-3">
        <div className="flex items-center gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-brand to-brand-2 text-primary-foreground">
            <Bot className="h-4 w-4" strokeWidth={2.5} />
          </div>
          <div>
            <div className="font-display text-sm font-semibold leading-none">PreventAI Coach</div>
            <div className="text-xs text-muted-foreground">
              {report ? "Knows your assessment · educational, not medical" : "No assessment yet · run one for personalized answers"}
            </div>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={reset} className="gap-1.5">
          <RefreshCw className="h-3.5 w-3.5" /> New chat
        </Button>
      </div>

      {/* Conversation */}
      <Conversation className="flex-1">
        <ConversationContent>
          {messages.length === 0 && (
            <div className="mx-auto max-w-md text-center">
              <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-brand/15 to-brand-2/15 text-[color:var(--brand)]">
                <HeartPulse className="h-6 w-6" />
              </div>
              <h3 className="mt-4 font-display text-xl font-semibold">Ask anything about your health</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                I'll reference your latest assessment to give you tailored guidance on diet, training, sleep and stress.
              </p>
              <div className="mt-5 grid gap-2 text-left">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => sendMessage({ text: s })}
                    className="rounded-xl border border-border/70 bg-card/60 px-3 py-2.5 text-sm hover:border-[color:color-mix(in_oklab,var(--brand)_50%,transparent)] hover:bg-[color:color-mix(in_oklab,var(--brand)_6%,var(--card))]"
                  >
                    <Sparkles className="mr-2 inline h-3.5 w-3.5 text-[color:var(--brand)]" />
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((m) => {
            const text = m.parts
              .map((p) => (p.type === "text" ? p.text : ""))
              .join("");
            return (
              <Message key={m.id} from={m.role}>
                <MessageContent
                  className={
                    m.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-transparent p-0 text-foreground"
                  }
                >
                  {m.role === "assistant" ? (
                    <div className="prose prose-sm max-w-none text-foreground prose-headings:font-display prose-headings:text-foreground prose-strong:text-foreground prose-a:text-[color:var(--brand)]">
                      <ReactMarkdown>{text}</ReactMarkdown>
                    </div>
                  ) : (
                    <span className="whitespace-pre-wrap text-sm">{text}</span>
                  )}
                </MessageContent>
              </Message>
            );
          })}

          {status === "submitted" && (
            <Message from="assistant">
              <MessageContent className="bg-transparent p-0">
                <Shimmer className="text-sm">Thinking…</Shimmer>
              </MessageContent>
            </Message>
          )}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>

      {/* Composer */}
      <div className="border-t border-border/60 bg-card/40 p-3">
        <PromptInput onSubmit={handleSubmit}>
          <PromptInputTextarea
            placeholder="Ask about your risks, diet, training, sleep…"
            disabled={isBusy}
            autoFocus
          />
          <PromptInputFooter className="justify-end">
            <PromptInputSubmit status={status} disabled={isBusy} />
          </PromptInputFooter>
        </PromptInput>
      </div>
    </div>
  );
}
