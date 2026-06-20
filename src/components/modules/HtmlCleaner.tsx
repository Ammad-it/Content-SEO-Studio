"use client"

import * as React from "react"
import { useState } from "react"
import { Copy, Download, Settings2, Trash2, Code2 } from "lucide-react"
import { motion } from "framer-motion"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cleanHtml } from "@/lib/htmlCleaner"

export function HtmlCleaner() {
  const [inputHtml, setInputHtml] = useState("")
  const [outputHtml, setOutputHtml] = useState("")
  const [preserveClasses, setPreserveClasses] = useState(false)
  const [activeTab, setActiveTab] = useState("clean")

  const handleClean = () => {
    const cleaned = cleanHtml(inputHtml, { preserveClasses })
    setOutputHtml(cleaned)
  }

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const handleDownload = (text: string, filename: string) => {
    const blob = new Blob([text], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  const getPlainText = () => {
    if (typeof window === "undefined") return ""
    const tempDiv = document.createElement("div")
    tempDiv.innerHTML = outputHtml
    return tempDiv.textContent || tempDiv.innerText || ""
  }

  const getMarkdown = () => {
    let md = outputHtml
    md = md.replace(/<h1>(.*?)<\/h1>/gi, "# $1\n\n")
    md = md.replace(/<h2>(.*?)<\/h2>/gi, "## $1\n\n")
    md = md.replace(/<h3>(.*?)<\/h3>/gi, "### $1\n\n")
    md = md.replace(/<p>(.*?)<\/p>/gi, "$1\n\n")
    md = md.replace(/<strong>(.*?)<\/strong>/gi, "**$1**")
    md = md.replace(/<em>(.*?)<\/em>/gi, "*$1*")
    md = md.replace(/<[^>]*>?/gm, '')
    return md.trim()
  }

  const getActiveContent = () => {
    if (activeTab === "clean") return outputHtml;
    if (activeTab === "text") return getPlainText();
    if (activeTab === "md") return getMarkdown();
    return outputHtml;
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col h-full space-y-6"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
            HTML Cleaner
          </h2>
          <p className="text-muted-foreground mt-1">Convert messy pasted HTML into clean, SEO-friendly code.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center space-x-2 px-4 py-2 rounded-md bg-muted/30 border border-border/50">
            <Switch 
              id="preserve-classes" 
              checked={preserveClasses}
              onCheckedChange={setPreserveClasses}
            />
            <Label htmlFor="preserve-classes" className="cursor-pointer font-medium text-sm">
              Preserve Classes
            </Label>
          </div>
          <Button variant="outline" className="group" onClick={() => { setInputHtml(""); setOutputHtml(""); }}>
            <Trash2 className="mr-2 h-4 w-4 group-hover:text-destructive transition-colors" />
            Clear
          </Button>
          <Button 
            className="shadow-md shadow-primary/20 transition-all hover:scale-[1.02]" 
            onClick={handleClean} 
            disabled={!inputHtml}
          >
            Clean HTML
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-[600px]">
        
        {/* INPUT */}
        <Card className="flex flex-col h-full border-muted/60 shadow-sm overflow-hidden bg-gradient-to-b from-card to-card/50">
          <CardHeader className="py-4 border-b bg-muted/20">
            <CardTitle className="text-sm font-medium flex items-center justify-between">
              <span className="flex items-center">
                <Code2 className="mr-2 h-4 w-4 text-primary" />
                Raw Input
              </span>
              <span className="text-xs text-muted-foreground font-normal bg-background/50 px-2 py-1 rounded">
                Paste Word / Gutenberg / Elementor HTML
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 p-0 relative min-h-[400px]">
            <Textarea 
              className="absolute inset-0 w-full h-full border-0 focus-visible:ring-0 resize-none p-4 font-mono text-sm bg-transparent"
              placeholder="<!-- Paste messy HTML here -->"
              value={inputHtml}
              onChange={(e) => setInputHtml(e.target.value)}
            />
          </CardContent>
        </Card>

        {/* OUTPUT */}
        <Card className="flex flex-col h-full border-muted/60 shadow-sm overflow-hidden bg-gradient-to-b from-card to-card/50">
          <Tabs
            value={activeTab}
            onValueChange={(value) => {
              if (typeof value === "string") setActiveTab(value)
            }}
            className="flex flex-col h-full"
          >
            <CardHeader className="py-3 px-4 border-b bg-muted/20 flex flex-row items-center justify-between space-y-0">
              <TabsList className="h-9 bg-background/50 border border-border/50">
                <TabsTrigger value="clean" className="text-xs px-3">Clean HTML</TabsTrigger>
                <TabsTrigger value="text" className="text-xs px-3">Text</TabsTrigger>
                <TabsTrigger value="md" className="text-xs px-3">Markdown</TabsTrigger>
              </TabsList>
              
              <div className="flex items-center space-x-1">
                <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-primary transition-colors" onClick={() => handleDownload(getActiveContent(), "cleaned.html")} title="Download">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="flex-1 p-0 relative min-h-[400px]">
              <ScrollArea className="h-full absolute inset-0">
                <TabsContent value="clean" className="m-0 h-full">
                  <Textarea 
                    readOnly
                    className="w-full h-full min-h-[400px] border-0 focus-visible:ring-0 resize-none p-4 font-mono text-sm bg-transparent"
                    value={outputHtml}
                    placeholder="Cleaned output will appear here"
                  />
                </TabsContent>
                <TabsContent value="text" className="m-0 h-full">
                  <Textarea 
                    readOnly
                    className="w-full h-full min-h-[400px] border-0 focus-visible:ring-0 resize-none p-4 font-mono text-sm bg-transparent"
                    value={getPlainText()}
                  />
                </TabsContent>
                <TabsContent value="md" className="m-0 h-full">
                  <Textarea 
                    readOnly
                    className="w-full h-full min-h-[400px] border-0 focus-visible:ring-0 resize-none p-4 font-mono text-sm bg-transparent"
                    value={getMarkdown()}
                  />
                </TabsContent>
              </ScrollArea>
            </CardContent>
            
            {/* COPY BUTTON AT BOTTOM */}
            <div className="p-4 border-t bg-muted/10">
              <Button 
                className="w-full py-6 text-md font-medium shadow-sm transition-all hover:scale-[1.01]" 
                variant="default"
                onClick={() => handleCopy(getActiveContent())}
                disabled={!outputHtml}
              >
                <Copy className="mr-2 h-5 w-5" /> 
                Copy {activeTab === "clean" ? "HTML" : activeTab === "text" ? "Text" : "Markdown"}
              </Button>
            </div>
          </Tabs>
        </Card>
      </div>
    </motion.div>
  )
}
