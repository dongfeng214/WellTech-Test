import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI } from '@google/genai';
import { FollowUpEvent, Customer } from '../types';
import { Bot, Send, User as UserIcon, Loader2, Sparkles, FileText, Link as LinkIcon } from 'lucide-react';
import Markdown from 'react-markdown';
import { cn } from '../utils';

interface AIChatbotProps {
  customer: Customer;
  events: FollowUpEvent[];
}

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
}

export function AIChatbot({ customer, events }: AIChatbotProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatRef = useRef<any>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    initChatAndSummarize();
  }, [customer.id]);

  const initChatAndSummarize = async () => {
    setIsLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY as string });
      
      const systemInstruction = `你是一个专业的CRM AI助手。你的任务是基于提供的客户跟进记录和附件信息，准确回答用户的问题。

【核心原则】
1. 绝对准确，拒绝幻觉：只能使用我提供的跟进记录和附件信息来回答。如果提供的信息中没有答案，请明确回答“根据现有记录，未找到相关信息”。绝对不要捏造或猜测任何事实。
2. 强制引用来源：当你的回答基于某次沟通或某个附件时，必须使用Markdown链接格式引用来源文件或记录。例如：[会议纪要.docx](附件URL) 或 [2023-10-25 线上会议](#)。
3. 突出关键信息：使用加粗（**文本**）来强调关键数据、客户明确的意向、核心痛点、金额等重要信息。
4. 结构化排版：使用列表、引用（>）等Markdown语法，让内容层次分明、易于阅读。

当前客户：${customer.name} (${customer.company})
如果用户没有提问，请主动提供一份简短的跟进历史概要（包括目前的进展、客户意向、关键问题以及下一步建议），并务必附上相关的文件来源链接。`;

      chatRef.current = ai.chats.create({
        model: 'gemini-3.1-pro-preview',
        config: {
          systemInstruction,
          temperature: 0.2, // Lower temperature to reduce hallucination
        }
      });

      const eventsContext = events.map(e => {
        let context = `【跟进记录】\n时间: ${e.date}\n方式: ${e.type}\n详情: ${e.description}\n下一步: ${e.nextStep || '无'}`;
        if (e.attachments && e.attachments.length > 0) {
          context += `\n附件留痕:\n${e.attachments.map(a => `- [${a.name}](${a.url})`).join('\n')}`;
        }
        return context;
      }).join('\n\n');

      const prompt = `以下是该客户的全部跟进历史记录及附件索引：\n\n${eventsContext}\n\n请生成一份概要总结。`;

      const response = await chatRef.current.sendMessage({ message: prompt });
      
      setMessages([
        { id: '1', role: 'model', text: response.text }
      ]);
    } catch (error) {
      console.error('AI Initialization error:', error);
      setMessages([
        { id: '1', role: 'model', text: '抱歉，AI助手初始化失败，请检查API Key配置。' }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || !chatRef.current) return;

    const userText = input.trim();
    setInput('');
    setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', text: userText }]);
    setIsLoading(true);

    try {
      const response = await chatRef.current.sendMessage({ message: userText });
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', text: response.text }]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', text: '抱歉，处理您的请求时发生错误。' }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Custom Markdown components for better typography and source linking
  const markdownComponents = {
    a: ({ node, ...props }: any) => (
      <a 
        {...props} 
        target="_blank" 
        rel="noopener noreferrer" 
        className="inline-flex items-center space-x-1 bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md text-xs font-medium border border-indigo-200 hover:bg-indigo-100 hover:border-indigo-300 transition-all mx-1 shadow-sm"
        title="点击查看源文件/记录"
      >
        <FileText className="w-3 h-3" />
        <span className="underline decoration-indigo-300 underline-offset-2">{props.children}</span>
      </a>
    ),
    strong: ({ node, ...props }: any) => (
      <strong {...props} className="font-semibold text-indigo-900 bg-indigo-50/80 px-1 rounded mx-0.5" />
    ),
    blockquote: ({ node, ...props }: any) => (
      <blockquote {...props} className="border-l-4 border-indigo-400 bg-indigo-50/50 pl-4 py-2 my-3 text-slate-700 rounded-r-lg italic shadow-sm" />
    ),
    ul: ({ node, ...props }: any) => (
      <ul {...props} className="list-disc pl-5 space-y-1 my-2 marker:text-indigo-400" />
    ),
    ol: ({ node, ...props }: any) => (
      <ol {...props} className="list-decimal pl-5 space-y-1 my-2 marker:text-indigo-600 marker:font-medium" />
    ),
    h3: ({ node, ...props }: any) => (
      <h3 {...props} className="text-sm font-bold text-slate-800 mt-4 mb-2 flex items-center before:content-[''] before:w-1 before:h-4 before:bg-indigo-500 before:mr-2 before:rounded-full" />
    ),
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-indigo-100 overflow-hidden flex flex-col h-[500px]">
      <div className="bg-gradient-to-r from-indigo-50 to-white px-5 py-4 border-b border-indigo-100 flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-sm">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">AI 深度跟进助手</h3>
            <p className="text-xs text-slate-500 mt-0.5">基于真实留痕分析，拒绝信息幻觉</p>
          </div>
        </div>
        <div className="flex items-center space-x-1 text-xs font-medium text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>已连接知识库</span>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-5 space-y-6 bg-slate-50/50">
        {messages.map((msg) => (
          <div key={msg.id} className={cn("flex space-x-3", msg.role === 'user' ? "flex-row-reverse space-x-reverse" : "")}>
            <div className={cn("w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm", msg.role === 'user' ? "bg-slate-800 text-white" : "bg-indigo-100 text-indigo-600")}>
              {msg.role === 'user' ? <UserIcon className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>
            <div className={cn("max-w-[85%] rounded-2xl px-5 py-4 text-sm leading-relaxed", msg.role === 'user' ? "bg-slate-800 text-white shadow-md" : "bg-white border border-slate-200 text-slate-700 shadow-sm")}>
              {msg.role === 'user' ? (
                <p className="whitespace-pre-wrap">{msg.text}</p>
              ) : (
                <div className="markdown-body prose-sm max-w-none">
                  <Markdown components={markdownComponents}>{msg.text}</Markdown>
                </div>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex space-x-3">
            <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0 shadow-sm">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl px-5 py-4 shadow-sm flex items-center space-x-3">
              <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
              <span className="text-sm font-medium text-slate-500">正在检索留痕文件并深度分析...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-white border-t border-slate-100 shrink-0">
        <form onSubmit={handleSend} className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="向AI提问，例如：上次会议客户提了哪些安全问题？"
            className="w-full pl-4 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all shadow-inner"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="absolute right-2 p-2 text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg disabled:opacity-50 disabled:bg-slate-200 disabled:text-slate-400 transition-colors shadow-sm"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}

