import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Copy, Download, Check } from "lucide-react";
import { useState } from "react";
import type { DiamondNotes } from "@shared/schema";

interface DiamondNotesDisplayProps {
  notes: DiamondNotes;
  className: string;
  subject: string;
}

export function DiamondNotesDisplay({ notes, className, subject }: DiamondNotesDisplayProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    const notesText = formatNotesAsText(notes);
    try {
      await navigator.clipboard.writeText(notesText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  const formatNotesAsText = (notes: DiamondNotes) => {
    let text = `📚 ${notes.chapterTitle}\n\n`;
    
    notes.headings.forEach(heading => {
      text += `${heading.number}. ${heading.title}\n`;
      heading.bulletPoints.forEach(point => {
        text += `   • ${point}\n`;
      });
      text += '\n';
    });
    
    text += `📝 Conclusion\n${notes.conclusion}\n\n`;
    text += `🔑 Keywords to Remember\n${notes.keywords.join(', ')}`;
    
    return text;
  };

  const downloadAsText = () => {
    const notesText = formatNotesAsText(notes);
    const blob = new Blob([notesText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${notes.chapterTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_notes.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="w-full fade-in" data-testid="diamond-notes-display">
      <CardHeader className="border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold text-foreground" data-testid="notes-title">
              Generated Diamond Notes
            </h3>
            <p className="text-sm text-muted-foreground" data-testid="notes-metadata">
              Class {className} - {subject}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={copyToClipboard}
              className="text-xs"
              data-testid="copy-notes-button"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 mr-1" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-1" />
                  Copy
                </>
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={downloadAsText}
              className="text-xs"
              data-testid="download-notes-button"
            >
              <Download className="h-4 w-4 mr-1" />
              Download
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <ScrollArea className="max-h-96 p-6" data-testid="notes-content">
          <div className="prose max-w-none">
            <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center">
              📚 {notes.chapterTitle}
            </h2>
            
            <div className="space-y-6">
              {notes.headings.map((heading, index) => (
                <div key={index} className="space-y-2">
                  <h3 className="text-lg font-semibold text-foreground">
                    {heading.number}. {heading.title}
                  </h3>
                  <ul className="list-disc list-inside space-y-1 text-foreground ml-4">
                    {heading.bulletPoints.map((point, pointIndex) => (
                      <li key={pointIndex} className="text-sm leading-relaxed">
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-accent rounded-lg">
              <h4 className="text-md font-semibold text-foreground mb-2 flex items-center">
                📝 Conclusion
              </h4>
              <p className="text-foreground text-sm leading-relaxed">
                {notes.conclusion}
              </p>
            </div>

            <div className="mt-4 p-4 bg-secondary/10 rounded-lg">
              <h4 className="text-md font-semibold text-foreground mb-3 flex items-center">
                🔑 Keywords to Remember
              </h4>
              <div className="flex flex-wrap gap-2">
                {notes.keywords.map((keyword, index) => (
                  <Badge 
                    key={index} 
                    variant="secondary" 
                    className="bg-secondary/20 text-secondary-foreground"
                  >
                    {keyword}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
