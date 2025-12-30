# ⚡ Quick AI Setup - 5 Minutes
## Get Advanced AI Recommendations Running

### 🚀 **Instant Setup (Works Without API Keys)**

The system works immediately with intelligent fallbacks. For full AI power, add OpenAI key.

### **Step 1: Install New Dependencies (2 minutes)**
```bash
cd lantern-ai/backend
npm install openai@^4.20.1
```

### **Step 2: Environment Setup (1 minute)**
```bash
# Copy environment file if you haven't already
cp .env.example .env

# Edit .env file and add (optional):
OPENAI_API_KEY=your-key-here
```

### **Step 3: Start Servers (1 minute)**
```bash
# Terminal 1 - Backend
cd lantern-ai/backend
npm run dev

# Terminal 2 - Frontend  
cd lantern-ai/frontend
npm run dev
```

### **Step 4: Test New Features (1 minute)**
1. Open http://localhost:3001
2. Complete assessment
3. View results → **See 4 new tabs!**
   - **Career Matches** (enhanced)
   - **📚 Course Plan** (NEW)
   - **💼 Local Jobs** (NEW) 
   - **🎯 Action Plan** (NEW)

---

## 🎯 **What You'll See**

### **Without OpenAI Key (Still Amazing!)**
- Intelligent course recommendations by year
- Local job market analysis within 40 miles
- Rule-based career pathways
- Skill gap analysis
- Actionable next steps

### **With OpenAI Key (Full AI Power!)**
- Personalized AI-generated guidance
- Custom career pathways from GPT
- Detailed reasoning for recommendations
- Advanced skill development plans
- Context-aware action items

---

## 🔑 **Get OpenAI API Key (Optional)**

1. Visit [OpenAI Platform](https://platform.openai.com/api-keys)
2. Create account (free tier available)
3. Generate API key
4. Add to `.env` file: `OPENAI_API_KEY=your-key-here`
5. Restart backend server

**Cost**: ~$0.01-0.05 per student assessment (very affordable!)

---

## ✅ **Verification Checklist**

- [ ] Backend starts without errors
- [ ] Frontend loads at http://localhost:3001
- [ ] Assessment completes successfully
- [ ] Results page shows 4 tabs
- [ ] Course Plan tab shows year-by-year recommendations
- [ ] Local Jobs tab shows opportunities within 40 miles
- [ ] Action Plan tab shows career pathway steps

---

## 🚨 **Troubleshooting**

### **"Module not found: openai"**
```bash
cd lantern-ai/backend
rm -rf node_modules package-lock.json
npm install
```

### **"OpenAI API key not found" (This is OK!)**
- System works with fallback logic
- Add API key for full AI features
- Check backend console for "⚠️ OpenAI API key not found, using fallback"

### **Results page shows old interface**
- Clear browser cache (Ctrl+F5)
- Check that both servers restarted
- Verify no console errors in browser

---

## 🎉 **You're Ready!**

The Lantern AI platform now has **advanced AI-powered recommendations** that will impress judges at the Presidential AI Challenge. The system provides:

✅ **Personalized course planning** by year  
✅ **Local job market analysis** within 40 miles  
✅ **AI-generated career pathways** with step-by-step guidance  
✅ **Professional 4-tab interface** for comprehensive results  
✅ **Works with or without API keys** - intelligent fallbacks  

**This is competition-winning AI innovation! 🏆**