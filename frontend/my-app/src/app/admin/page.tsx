"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

// Simple notification component (so this file is self-contained).
function Notification({
  message,
  type,
  onClose,
}: {
  message: string;
  type: "success" | "error" | "info";
  onClose: () => void;
}) {
  if (!message) return null;
  const base =
    "fixed right-4 top-4 z-50 rounded-lg px-4 py-2 shadow-md text-sm font-medium";
  const color =
    type === "success"
      ? "bg-green-50 text-green-800"
      : type === "error"
      ? "bg-red-50 text-red-800"
      : "bg-blue-50 text-blue-800";
  return (
    <div className={`${base} ${color}`} role="status">
      <div className="flex items-center gap-3">
        <div>{message}</div>
        <button
          onClick={onClose}
          className="text-xs opacity-60 hover:opacity-100"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}

export default function MailService() {
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [notif, setNotif] = useState<{
    msg: string;
    type: "success" | "error" | "info";
  } | null>(null);

  function isValidEmail(email: string) {
    // simple email regex — good enough for UI validation
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  const sendMail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidEmail(to)) {
      setNotif({ msg: "Invalid recipient email.", type: "error" });
      return;
    }
    if (!subject.trim() && !message.trim()) {
      setNotif({
        msg: "Add a subject or message before sending.",
        type: "info",
      });
      return;
    }

    setLoading(true);
    setNotif(null);

    try {
      const res = await fetch("/api/send-mail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to, subject, message }),
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || "Failed to send mail");
      }

      setNotif({ msg: "Mail sent successfully!", type: "success" });
      setTo("");
      setSubject("");
      setMessage("");
    } catch (err: any) {
      console.error(err);
      setNotif({ msg: err?.message || "Error sending mail", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <Notification
        message={notif?.msg || ""}
        type={notif?.type || "info"}
        onClose={() => setNotif(null)}
      />

      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Mail Service</CardTitle>
          <p className="text-sm text-muted-foreground">
            Send an email from your app — frontend form + POST to{" "}
            <code className="rounded bg-slate-100 px-1 py-0.5">
              /api/send-mail
            </code>
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={sendMail} className="grid gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 items-center gap-2">
              <Label htmlFor="to" className="sr-only">
                To
              </Label>
              <div className="col-span-1">
                <div className="text-sm font-medium">To</div>
                <Input
                  id="to"
                  placeholder="recipient@example.com"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                />
              </div>

              <div className="col-span-2">
                <div className="text-sm font-medium">Subject</div>
                <Input
                  id="subject"
                  placeholder="Subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
              </div>
            </div>

            <div>
              <div className="text-sm font-medium mb-2">Message</div>
              <Textarea
                id="message"
                placeholder="Write your message here..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={8}
              />
            </div>

            <div className="flex items-center justify-end gap-2">
              <Button
                variant="ghost"
                type="button"
                onClick={() => {
                  setTo("");
                  setSubject("");
                  setMessage("");
                }}
              >
                Reset
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <div className="flex items-center gap-2">
                    <svg
                      className="animate-spin h-4 w-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <circle
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        className="opacity-25"
                      />
                      <path
                        d="M4 12a8 8 0 018-8"
                        stroke="currentColor"
                        strokeWidth="4"
                        strokeLinecap="round"
                        className="opacity-75"
                      />
                    </svg>
                    Sending...
                  </div>
                ) : (
                  "Send Mail"
                )}
              </Button>
            </div>
          </form>

          <div className="mt-6 text-xs text-muted-foreground">
            <strong>Note:</strong> This component only implements the frontend
            UI and will POST to <code>/api/send-mail</code>. You need a
            server-side route that actually sends the email (e.g. using
            nodemailer, SendGrid, or any transactional email API). See the
            commented example below.
          </div>

          <pre className="mt-4 rounded bg-slate-900 text-white text-xs p-3 overflow-auto">
            <code>
              {`// Example Next.js API (pages/api/send-mail.ts)
// import nodemailer and configure transporter with env vars
// export default async function handler(req,res){
//  if(req.method !== 'POST') return res.status(405)
//  const {to,subject,message} = req.body
//  // validate and then send via transporter.sendMail({to,from,subject,text:message})
//  return res.status(200).json({ok:true})
// }
`}
            </code>
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}
