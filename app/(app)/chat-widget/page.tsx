"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Copy,
  Check,
  Code2,
  ExternalLink,
  MessageCircle,
  Sparkles,
  Headset,
  Bot,
  Loader2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { APP_URL } from "@/constants";
import { getWidgetConfig, updateBusiness } from "@/services/services";

const ICON_OPTIONS = [
  { key: "chat", label: "Chat bubble", Icon: MessageCircle },
  { key: "sparkles", label: "Sparkles", Icon: Sparkles },
  { key: "headset", label: "Support headset", Icon: Headset },
  { key: "bot", label: "Bot", Icon: Bot },
] as const;

const DEFAULT_COLOR = "#7c3aed";
const DEFAULT_ICON = "chat";
const DEFAULT_TITLE = "Collex AI";
const DEFAULT_SUBTITLE = "Ask us anything, we're happy to help!";

export default function ChatWidgetAdminPage() {
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [primaryColor, setPrimaryColor] = useState(DEFAULT_COLOR);
  const [icon, setIcon] = useState<string>(DEFAULT_ICON);
  const [welcomeTitle, setWelcomeTitle] = useState(DEFAULT_TITLE);
  const [welcomeSubtitle, setWelcomeSubtitle] = useState(DEFAULT_SUBTITLE);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const businessId = user?.business;

  useEffect(() => {
    getWidgetConfig(businessId, {})
      .then((res) => {
        const cfg = res.data?.response?.widget_config ?? {};
        setPrimaryColor(cfg.primaryColor || DEFAULT_COLOR);
        setIcon(cfg.icon || DEFAULT_ICON);
        setWelcomeTitle(cfg.welcomeTitle || DEFAULT_TITLE);
        setWelcomeSubtitle(cfg.welcomeSubtitle || DEFAULT_SUBTITLE);
        setSuggestions(Array.isArray(cfg.suggestions) ? cfg.suggestions : []);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [businessId]);

  const MAX_SUGGESTIONS = 4;

  const updateSuggestion = (index: number, value: string) => {
    setSuggestions((prev) => prev.map((s, i) => (i === index ? value : s)));
  };

  const removeSuggestion = (index: number) => {
    setSuggestions((prev) => prev.filter((_, i) => i !== index));
  };

  const addSuggestion = () => {
    if (suggestions.length >= MAX_SUGGESTIONS) return;
    setSuggestions((prev) => [...prev, ""]);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await updateBusiness({
        id: businessId,
        widget_config: {
          primaryColor,
          icon,
          welcomeTitle,
          welcomeSubtitle,
          suggestions: suggestions.filter((s) => s.trim()),
        },
      });
      if (res.data.status) {
        toast.success("Widget appearance updated");
      }
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Couldn't save changes, try again",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const embedCode = `<script src="${APP_URL}/widget-loader.js" data-business-id="${businessId}" data-base-url="${APP_URL}"></script>`;

  const handleCopy = () => {
    navigator.clipboard.writeText(embedCode);
    setCopied(true);
    toast.success("Embed code copied");
    setTimeout(() => setCopied(false), 2000);
  };

  const previewUrl = `${APP_URL}/widget/${businessId}`;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Website Chat Widget
        </h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Code2 className="h-4 w-4" />
            Embed code
          </CardTitle>
          <CardDescription>
            Paste this snippet right before the closing{" "}
            <code>&lt;/body&gt;</code> tag on every page you want the chat
            bubble to appear.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="relative rounded-lg border bg-muted/40 p-4">
            <pre className="overflow-x-auto text-xs font-mono text-foreground whitespace-pre-wrap break-all">
              {embedCode}
            </pre>
            <Button
              size="sm"
              variant="outline"
              className="absolute top-2 right-2 gap-1.5"
              onClick={handleCopy}
            >
              {copied ? (
                <Check className="h-3.5 w-3.5" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
              {copied ? "Copied" : "Copy"}
            </Button>
          </div>

          <a
            href={previewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Preview the chat widget
          </a>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Appearance</CardTitle>
          <CardDescription>
            Match the widget to your brand. Changes apply instantly no need to
            update the embed code on your site.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {isLoading ? (
            <div className="flex justify-center py-6">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label>Brand color</Label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="h-9 w-14 cursor-pointer rounded-md border p-1"
                    />
                    <Input
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="w-32 font-mono text-sm"
                      maxLength={7}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Bubble icon</Label>
                  <div className="flex gap-2">
                    {ICON_OPTIONS.map(({ key, label, Icon }) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setIcon(key)}
                        title={label}
                        className={`flex h-11 w-11 items-center justify-center rounded-full border-2 cursor-pointer transition-colors ${
                          icon === key
                            ? "border-transparent text-white"
                            : "border-muted text-muted-foreground hover:border-foreground/30"
                        }`}
                        style={
                          icon === key
                            ? { background: primaryColor }
                            : undefined
                        }
                      >
                        <Icon className="h-5 w-5" />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input
                    value={welcomeTitle}
                    onChange={(e) => setWelcomeTitle(e.target.value)}
                    placeholder={DEFAULT_TITLE}
                    maxLength={60}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Subtitle</Label>
                  <Input
                    value={welcomeSubtitle}
                    onChange={(e) => setWelcomeSubtitle(e.target.value)}
                    placeholder={DEFAULT_SUBTITLE}
                    maxLength={100}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Quick suggestions (optional)</Label>
                  <p className="text-xs text-muted-foreground">
                    Shown as tappable chips before the visitor's first message.
                    Leave empty to use generic defaults.
                  </p>

                  <div className="space-y-2">
                    {suggestions.map((suggestion, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <Input
                          value={suggestion}
                          onChange={(e) =>
                            updateSuggestion(idx, e.target.value)
                          }
                          placeholder="e.g. What are your prices?"
                          maxLength={60}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="shrink-0"
                          onClick={() => removeSuggestion(idx)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>

                  {suggestions.length < MAX_SUGGESTIONS && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addSuggestion}
                    >
                      + Add suggestion
                    </Button>
                  )}
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSave} disabled={isSaving}>
                  {isSaving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Save changes"
                  )}
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">How it works</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-muted-foreground list-disc list-inside">
            <li>
              A floating chat bubble appears in the bottom-right corner of your
              site.
            </li>
            <li>
              Visitors can ask questions the AI answers from your uploaded
              knowledge base.
            </li>
            <li>
              When a visitor shares contact details, a lead is automatically
              created in your CRM.
            </li>
            <li>
              Works on any website WordPress, Shopify, custom HTML, anything.
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
