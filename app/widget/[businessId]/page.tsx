"use client";

import { useState, useRef, useEffect, useLayoutEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Bot,
  Send,
  Loader2,
  X,
  MessageCircle,
  Sparkles,
  Headset,
} from "lucide-react";
import { useParams } from "next/navigation";
import {
  messageChatAgent,
  getConversationHistory,
  getWidgetConfig,
} from "@/services/services";
import { cn } from "@/lib/utils";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface WidgetConfig {
  primaryColor?: string;
  icon?: string;
  welcomeTitle?: string;
  welcomeSubtitle?: string;
  suggestions?: string[];
}

const ICON_MAP: Record<string, typeof Bot> = {
  chat: MessageCircle,
  sparkles: Sparkles,
  headset: Headset,
  bot: Bot,
};

const DEFAULT_WELCOME_TITLE = "Chat with our team";
const DEFAULT_WELCOME_SUBTITLE = "Typically replies within a few minutes";
const DEFAULT_SUGGESTIONS = [
  "How can you help me?",
  "Tell me about your services",
  "Pricing details",
];

const HEX_RE = /^#([0-9a-fA-F]{6})$/;

const getOrCreateVisitorId = () => {
  const key = "collex_visitor_id";
  let id = localStorage.getItem(key);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(key, id);
  }
  return id;
};

// Widget iframe ke andar hai ya standalone tab mein khula hai — close button
const isInsideIframe = () => {
  try {
    return window.self !== window.top;
  } catch {
    return true;
  }
};

export default function WidgetPage() {
  const { businessId } = useParams<{ businessId: string }>();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [visitorId, setVisitorId] = useState<string | null>(null);
  const [widgetConfig, setWidgetConfig] = useState<WidgetConfig>({});

  const headerRef = useRef<HTMLDivElement | null>(null);
  const inputBarRef = useRef<HTMLDivElement | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const [headerHeight, setHeaderHeight] = useState(0);
  const [inputHeight, setInputHeight] = useState(0);

  useEffect(() => {
    const vid = getOrCreateVisitorId();
    setVisitorId(vid);

    getConversationHistory({ businessId, visitorId: vid })
      .then((res) => {
        const history = res.data?.response?.messages || [];
        setMessages(
          history.map((m: any) => ({ role: m.role, content: m.content })),
        );
      })
      .catch(() => {})
      .finally(() => setIsLoadingHistory(false));

    getWidgetConfig(businessId, {})
      .then((res) => {
        const cfg = res.data?.response?.widget_config ?? {};
        setWidgetConfig(cfg);
      })
      .catch(() => {});
  }, [businessId]);

  useEffect(() => {
    if (widgetConfig.primaryColor && HEX_RE.test(widgetConfig.primaryColor)) {
      document.documentElement.style.setProperty(
        "--primary",
        widgetConfig.primaryColor,
      );
    }
  }, [widgetConfig.primaryColor]);

  useLayoutEffect(() => {
    if (!headerRef.current || !inputBarRef.current) return;

    const headerEl = headerRef.current;
    const inputEl = inputBarRef.current;

    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const h = Math.ceil(entry.contentRect.height);
        if (entry.target === headerEl) setHeaderHeight(h);
        if (entry.target === inputEl) setInputHeight(h);
      }
    });
    ro.observe(headerEl);
    ro.observe(inputEl);

    setHeaderHeight(headerEl.getBoundingClientRect().height);
    setInputHeight(inputEl.getBoundingClientRect().height);

    return () => ro.disconnect();
  }, [widgetConfig.welcomeTitle, widgetConfig.welcomeSubtitle]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, isSending]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || isSending || !visitorId) return;

    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setInput("");
    setIsSending(true);

    try {
      const { data } = await messageChatAgent({
        businessId,
        visitorId,
        message: text,
      });
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data?.response?.reply ?? "..." },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, something went wrong. Please try again.",
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  const handleClose = () => {
    if (isInsideIframe()) {
      window.parent.postMessage({ type: "collex-widget-close" }, "*");
    }
  };

  const brandColor =
    widgetConfig.primaryColor && HEX_RE.test(widgetConfig.primaryColor)
      ? widgetConfig.primaryColor
      : undefined;

  const HeaderIcon = ICON_MAP[widgetConfig.icon ?? ""] ?? Bot;

  const suggestions = widgetConfig.suggestions?.length
    ? widgetConfig.suggestions
    : DEFAULT_SUGGESTIONS;

  return (
    <div className="flex h-dvh min-h-0 flex-col bg-background">
      <div ref={headerRef} className="w-full bg-white">
        <div className="flex shrink-0 items-center justify-between border-b px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
              <HeaderIcon className="h-5 w-5 text-primary" />
            </div>

            <div>
              <h2 className="font-semibold">
                {widgetConfig.welcomeTitle || DEFAULT_WELCOME_TITLE}
              </h2>

              {/* <p className="text-xs text-muted-foreground">
                {widgetConfig.welcomeSubtitle || DEFAULT_WELCOME_SUBTITLE}
              </p> */}
            </div>
          </div>

          {isInsideIframe() && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              className="shrink-0"
            >
              <X className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto scroll-smooth px-4">
        <div className="flex flex-col gap-3 py-4">
          {isLoadingHistory ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : messages.length === 0 ? (
            <div className="fixed w-full top-[30%] left-0 flex flex-col justify-center items-center pt-8 px-4 text-center animate-in fade-in duration-500">
              <h3 className="mb-1 text-lg font-semibold">
                {widgetConfig.welcomeTitle || "Hi there!"}
              </h3>

              <p className="mb-1 text-sm text-muted-foreground max-w-xs">
                {widgetConfig.welcomeSubtitle ||
                  "Ask us anything, we're happy to help!"}
              </p>

              {suggestions.length > 0 && (
                <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
                  {suggestions.map((suggestion, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setInput(suggestion);
                        setTimeout(() => {
                          const inputElement = document.querySelector("input");
                          if (inputElement) {
                            const event = new KeyboardEvent("keydown", {
                              key: "Enter",
                            });
                            inputElement.dispatchEvent(event);
                          }
                        }, 100);
                      }}
                      className="rounded-full border border-primary/20 bg-primary/5 px-3 py-1.5 text-xs text-primary transition-all hover:bg-primary/10 hover:scale-105 active:scale-95 hover:border-primary/40 cursor-pointer"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            messages.map((msg, i) => (
              <div
                key={i}
                className={cn(
                  "flex max-w-[85%] gap-2",
                  msg.role === "user"
                    ? "self-end flex-row-reverse"
                    : "self-start",
                )}
              >
                <div
                  className={cn(
                    "rounded-2xl px-3 py-2 text-sm",
                    msg.role === "user"
                      ? "rounded-lg text-primary-foreground"
                      : "rounded-lg bg-muted",
                  )}
                  style={
                    msg.role === "user" && brandColor
                      ? { backgroundColor: brandColor }
                      : undefined
                  }
                >
                  {msg.content}
                </div>
              </div>
            ))
          )}

          {isSending && (
            <div className="flex max-w-[85%] gap-2 self-start">
              <div className="rounded-lg bg-muted px-4 py-3">
                <div className="flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/60 animate-bounce [animation-delay:-0.3s]" />
                  <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/60 animate-bounce [animation-delay:-0.15s]" />
                  <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/60 animate-bounce" />
                </div>
              </div>
            </div>
          )}

          {/* Always the true last node — scrollIntoView always lands past
              every message, never mid-bubble behind the fixed input. */}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input */}
      <div ref={inputBarRef} className="w-full">
        <div className="flex shrink-0 gap-2 bg-background p-3">
          <Input
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSend();
              }
            }}
            autoFocus
            disabled={isSending || isLoadingHistory}
          />

          <Button
            size="icon"
            onClick={handleSend}
            disabled={isSending || !input.trim()}
            className="shrink-0"
            style={brandColor ? { backgroundColor: brandColor } : undefined}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
