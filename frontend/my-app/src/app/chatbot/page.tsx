"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { jsPDF } from "jspdf";

const BeachAdvisor: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);

  const GEMINI_API_KEY = "AIzaSyAlFcAOeyQuQL7AXzR6_DX_LYDwMpraxdA";

  const handleGeneratePDF = async () => {
    if (!input.trim()) {
      setError("Please enter a beach request.");
      return;
    }
    setError(null);
    setLoading(true);

    try {
      const prompt = `
      As a professional beach safety advisory AI, analyze the following user request and provide a detailed advisory report:

      USER REQUEST: "${input}"

      Generate a comprehensive beach visit advisory report with safety recommendations.
      `;

      const response = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": GEMINI_API_KEY || "",
          },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
          }),
        }
      );

      const data = await response.json();
      const generated =
        data?.candidates?.[0]?.content?.parts?.[0]?.text ||
        "No response received.";

      // Generate PDF only (no UI display)
      const doc = new jsPDF({ unit: "mm", format: "a4" });
      const margin = 15;
      const pageHeight = doc.internal.pageSize.height;
      let y = margin;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(12);

      const lines = doc.splitTextToSize(generated, 180);

      lines.forEach((line: any) => {
        if (y > pageHeight - margin) {
          doc.addPage();
          y = margin;
        }
        doc.text(line, margin, y);
        y += 8;
      });

      doc.save("Beach_Advisory_Report.pdf");
    } catch (err: any) {
      setError("Failed to generate PDF: " + err.message);
    } finally {
      setLoading(false);
      setInput("");
    }
  };

  return (
    <div className="max-w-lg mx-auto p-6 space-y-4">
      <h1 className="text-xl font-bold text-blue-600 text-center">
        🌊 Beach Visit Advisor
      </h1>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Enter your beach request..."
        className="w-full border rounded-lg p-2"
        onKeyDown={(e) => e.key === "Enter" && handleGeneratePDF()}
      />
      <Button onClick={handleGeneratePDF} disabled={loading} className="w-full">
        {loading ? "Generating PDF..." : "Generate Advisory PDF"}
      </Button>
      {error && (
        <div className="text-red-600 bg-red-100 p-2 rounded">{error}</div>
      )}
    </div>
  );
};

export default BeachAdvisor;
