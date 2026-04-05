import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SavingsplanService } from '../../services/savingsplan.service';
import { PlanapplicationService } from '../../services/planapplication.service';
import { EnquiryService } from '../../services/enquiry.service';
import { AuthService } from '../../services/auth.service';
import { environment } from 'src/environments/environment';

interface Message {
  role: 'user' | 'assistant';
  text: string;
  time: string;
}

@Component({
  selector: 'app-chatbot',
  templateUrl: './chatbot.component.html',
  styleUrls: ['./chatbot.component.css']
})
export class ChatbotComponent implements OnInit {

  isOpen = false;
  isTyping = false;
  isCoolingDown = false;
  userInput = '';
  messages: Message[] = [];

  savingsPlans: any[] = [];
  myApplications: any[] = [];
  myEnquiriesCount = 0;
  userId = 0;
  username = '';
  dataLoaded = false;

  private readonly GROQ_API_KEY = environment.groq;

  constructor(
    private savingsplanService: SavingsplanService,
    private planAppService: PlanapplicationService,
    private enquiryService: EnquiryService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.userId = this.authService.getUserId();
    const user = (this.authService as any)['currentUserSubject'].value;
    this.username = user?.username || 'there';
  }

  toggleChat(): void {
    this.isOpen = !this.isOpen;
    if (this.isOpen && this.messages.length === 0) {
      this.loadDataAndGreet();
    }
  }

  loadDataAndGreet(): void {
    this.isTyping = true;

    this.savingsplanService.getAllSavingsPlans().subscribe(
      (data: any) => {
        const plans = data.content ? data.content : data;
        this.savingsPlans = plans.filter((p: any) => p.status === 'Active');
      }
    );

    this.planAppService.getAppliedPlans(this.userId).subscribe(
      (data: any) => {
        const apps = Array.isArray(data) ? data : (data.content ? data.content : []);
        this.myApplications = apps;
      }
    );

    this.enquiryService.getAllEnquiries().subscribe(
      (data: any) => {
        const all = Array.isArray(data) ? data : (data.content ? data.content : []);
        this.myEnquiriesCount = all.filter((e: any) => {
          const id = e.user?.userId || (e as any).userId;
          return Number(id) === Number(this.userId);
        }).length;
        this.dataLoaded = true;
        this.isTyping = false;

        this.addBotMessage(
          `Hi ${this.username}! 👋 I'm your Finance Hub assistant. I can help you with:\n\n` +
          `• 📊 Suggesting the right savings plan for you\n` +
          `• 📋 Checking your application status\n` +
          `• 💡 Answering finance questions\n` +
          `• 🧭 Navigating the app\n\n` +
          `What would you like to know?`
        );
      }
    );
  }

async sendMessage(): Promise<void> {
    const text = this.userInput.trim();
    if (!text || this.isTyping || this.isCoolingDown) return;

    this.addUserMessage(text);
    this.userInput = '';
    this.isTyping = true;

    try {
      const groqMessages = [
        { role: 'system', content: this.buildSystemPrompt() },
        ...this.messages
          .slice(-4)
          .map(m => ({
            role: m.role === 'assistant' ? 'assistant' : 'user',
            content: m.text
          })),
        { role: 'user', content: text }
      ];

      const response = await fetch(
        'https://api.groq.com/openai/v1/chat/completions',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.GROQ_API_KEY}`
          },
          body: JSON.stringify({
            model: 'llama-3.3-70b-versatile',
            messages: groqMessages,
            max_tokens: 800,
            temperature: 0.7
          })
        }
      );

      if (response.status === 429) {
        this.addBotMessage('⏳ Too many requests. Please wait a few seconds and try again.');
        this.isTyping = false;
        return;
      }

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      let reply = data?.choices?.[0]?.message?.content
        || 'Sorry, I could not process that. Please try again.';

      const navMatch = reply.match(/\[NAVIGATE:([^\]]+)\]/);
      if (navMatch) {
        const route = navMatch[1].trim();
        reply = reply.replace(/\[NAVIGATE:[^\]]+\]/, '').trim();
        this.addBotMessage(reply);
        // navigate after delay but do NOT close the chat
        setTimeout(() => {
          this.router.navigate([route]);
        }, 1500);
      } else {
        this.addBotMessage(reply);
      }

    } catch (err) {
      this.addBotMessage('Sorry, something went wrong. Please try again.');
    }

    this.isTyping = false;
  }

  buildSystemPrompt(): string {
    const plansText = this.savingsPlans.length > 0
      ? this.savingsPlans.map(p =>
          `- ID:${p.savingsPlanId} ${p.name}: Goal ₹${p.goalAmount}, ${p.timeFrame} months, Risk: ${p.riskLevel}`
        ).join('\n')
      : 'No active plans available.';

    const appText = this.myApplications.length > 0
      ? this.myApplications.map(a =>
          `- ${a.savingsPlan?.name || 'Unknown'}: ₹${a.amountRequired}, Status: ${a.status}`
        ).join('\n')
      : 'No applications yet.';

    return `You are a Finance Hub assistant helping ${this.username} with savings plans and finance questions.

ACTIVE PLANS:
${plansText}

USER APPLICATIONS:
${appText}

ENQUIRIES SUBMITTED: ${this.myEnquiriesCount}

NAVIGATION COMMANDS — CRITICAL RULES:
You must ONLY append a [NAVIGATE:] command when the user is EXPLICITLY asking to go somewhere or take an action like applying, viewing, or adding something. 

NEVER add [NAVIGATE:] for:
- General finance questions (what is SIP, what is FD, explain mutual funds, etc.)
- Questions about the app (what is Finance Hub, how does this work, etc.)
- Plan suggestions or comparisons
- Any informational or educational question
- Greetings or casual conversation

ONLY add [NAVIGATE:] when user says things like:
- "take me to", "go to", "show me the page", "navigate to", "open"
- "I want to apply for [plan name]" or "apply to [plan]"
- "show my applications", "view my enquiries", "add an enquiry"
- "I want to submit feedback", "take me to feedback"

Available navigation commands:
- Show all plans page → [NAVIGATE:/user/view-savings-plan]
- Apply for a specific plan (use real plan ID) → [NAVIGATE:/user/apply-plan/PLAN_ID]
- Show my applications page → [NAVIGATE:/user/applied-plans]
- Add enquiry page → [NAVIGATE:/user/add-enquiry]
- View enquiries page → [NAVIGATE:/user/view-enquiry]
- Add feedback page → [NAVIGATE:/user/add-feedback]
- View feedback page → [NAVIGATE:/user/view-feedback]
- Dashboard → [NAVIGATE:/user/dashboard]

RULES:
1. Only answer Finance Hub app questions and general personal finance topics (SIP, FD, PPF, mutual funds, budgeting, savings, investments, risk, returns).
2. Refuse everything else politely — sports, coding, weather, news, entertainment, etc.
3. ONLY add a NAVIGATE command when the user explicitly asks to go somewhere or perform a navigation action.
4. When suggesting a specific plan to apply for, use its actual savingsPlanId from the plan list above.
5. Keep responses under 100 words. Be friendly and concise.
6. Use ₹ for currency. This is an Indian platform.
7. Never make up plan details.`;
  }

  addUserMessage(text: string): void {
    this.messages.push({ role: 'user', text, time: this.getTime() });
    this.scrollToBottom();
  }

  addBotMessage(text: string): void {
    this.messages.push({ role: 'assistant', text, time: this.getTime() });
    this.scrollToBottom();
  }

  getTime(): string {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  scrollToBottom(): void {
    setTimeout(() => {
      const el = document.getElementById('chat-messages');
      if (el) el.scrollTop = el.scrollHeight;
    }, 50);
  }

  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }
}