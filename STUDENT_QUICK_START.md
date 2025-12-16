# 🚀 Student Quick Start Guide
## Get Lantern AI Running in 10 Minutes

### 📋 Prerequisites
- **Node.js** (version 16 or higher)
- **Git** for version control
- **Code Editor** (VS Code recommended)
- **Terminal/Command Prompt**

---

## ⚡ Quick Setup (10 Minutes)

### **Step 1: Clone the Project (2 minutes)**
```bash
git clone [your-repository-url]
cd PAC-Code/lantern-ai
```

### **Step 2: Install Dependencies (3 minutes)**
```bash
# Backend setup
cd backend
npm install

# Frontend setup  
cd ../frontend
npm install
```

### **Step 3: Environment Setup (2 minutes)**
```bash
# Backend environment
cd ../backend
cp .env.example .env

# Frontend environment
cd ../frontend  
cp .env.local.example .env.local
```

### **Step 4: Start Both Servers (3 minutes)**

**Terminal 1 - Backend:**
```bash
cd lantern-ai/backend
npm run dev
```
*Should show: "🚀 Lantern AI API running on port 3002"*

**Terminal 2 - Frontend:**
```bash
cd lantern-ai/frontend
npm run dev
```
*Should show: "▲ Next.js ready on http://localhost:3001"*

### **Step 5: Test the System**
1. Open browser to: **http://localhost:3001**
2. Click "Create Account" 
3. Try all three user types: Student, Counselor, Parent
4. Test the career assessment flow

---

## 🎯 Your Role-Specific Tasks

### **Frontend Specialist**
**Files to Focus On:**
- `frontend/app/components/` - UI components
- `frontend/app/page.tsx` - Homepage
- `frontend/app/*/page.tsx` - All page files

**Your Tasks:**
- Polish UI animations and transitions
- Improve mobile responsiveness  
- Add loading states and feedback
- Create demo presentation materials

### **Backend/AI Specialist**
**Files to Focus On:**
- `backend/src/services/` - Core logic
- `backend/src/routes/` - API endpoints
- `backend/src/data/` - Career data

**Your Tasks:**
- Enhance AI matching algorithms
- Add more career pathways
- Improve recommendation logic
- Document AI features

### **Testing Specialist**
**Files to Focus On:**
- All user-facing features
- `backend/src/__tests__/` - Test files
- Create test scenarios

**Your Tasks:**
- Test all user workflows
- Create demo accounts
- Document bugs and fixes
- Prepare test scenarios

### **Documentation Specialist**
**Files to Focus On:**
- All `.md` files
- Create presentation materials
- Document features

**Your Tasks:**
- Write technical documentation
- Create presentation slides
- Prepare demo scripts
- Make video demonstrations

---

## 🔧 Common Issues & Solutions

### **Backend Won't Start**
```bash
cd lantern-ai/backend
rm -rf node_modules
npm install
npm run dev
```

### **Frontend Won't Start**
```bash
cd lantern-ai/frontend
rm -rf node_modules .next
npm install
npm run dev
```

### **Port Already in Use**
- Backend uses port **3002**
- Frontend uses port **3001**
- Kill existing processes or change ports in config

### **Environment Variables Missing**
Make sure you have:
- `backend/.env` (copy from `.env.example`)
- `frontend/.env.local` (copy from `.env.local.example`)

---

## 📱 Testing the Multi-User System

### **Create Test Accounts**
1. **Student Account**: 
   - Name: Test Student
   - Email: student@test.com
   - Password: password123
   - Grade: 11th Grade

2. **Counselor Account**:
   - Name: Test Counselor  
   - Email: counselor@test.com
   - Password: password123
   - School: Test High School

3. **Parent Account**:
   - Name: Test Parent
   - Email: parent@test.com
   - Password: password123
   - Child: Test Child, 10th Grade

### **Test User Flows**
1. **Student Flow**: Register → Assessment → Results → Action Plan
2. **Counselor Flow**: Register → Dashboard → View Analytics
3. **Parent Flow**: Register → Dashboard → Track Child Progress

---

## 🎨 UI/UX Enhancement Ideas

### **Animations to Add**
- Loading spinners for API calls
- Smooth transitions between pages
- Progress bars for assessments
- Hover effects on buttons

### **Mobile Improvements**
- Touch-friendly button sizes
- Responsive navigation menu
- Optimized form layouts
- Fast loading on mobile

### **Visual Enhancements**
- Consistent color scheme
- Professional typography
- Clear visual hierarchy
- Accessible design elements

---

## 🤖 AI Features to Highlight

### **Current AI Implementation**
- **Career Matching Algorithm**: Matches student interests to careers
- **Personalized Recommendations**: Based on assessment responses
- **Action Plan Generation**: AI-created step-by-step guidance
- **Multi-factor Analysis**: Considers interests, skills, location

### **AI Enhancements to Add**
- More sophisticated matching logic
- Natural language processing for responses
- Predictive career pathway suggestions
- Personalized learning recommendations

---

## 📊 Demo Preparation

### **5-Minute Demo Script**
1. **Introduction** (30 seconds): Problem and solution
2. **Student Journey** (2 minutes): Assessment to action plan
3. **Multi-User System** (1.5 minutes): Show all three dashboards
4. **AI Innovation** (1 minute): Explain matching algorithm
5. **Impact & Future** (30 seconds): Rural student benefits

### **Demo Accounts Ready**
- Have pre-created accounts for smooth demo
- Pre-completed assessments showing results
- Sample action plans generated
- All three user types ready to show

---

## 🆘 Getting Help

### **Technical Issues**
1. Check the error message carefully
2. Look in browser console (F12)
3. Check terminal output for errors
4. Ask team members or mentors

### **Git/Code Issues**
1. Always pull latest changes: `git pull`
2. Create feature branches: `git checkout -b feature-name`
3. Commit often: `git add . && git commit -m "description"`
4. Push changes: `git push origin branch-name`

### **Team Communication**
- **Daily Standup**: 15 minutes each morning
- **Quick Questions**: Team chat/WhatsApp
- **Code Reviews**: GitHub pull requests
- **Blockers**: Escalate to mentors immediately

---

## 🎯 Success Checklist

### **Day 1 Goals**
- [ ] Environment setup complete
- [ ] System running locally
- [ ] Role assignment clear
- [ ] First tasks identified

### **Week 1 Goals**
- [ ] Core features polished
- [ ] AI enhancements implemented
- [ ] Testing completed
- [ ] Documentation started

### **Final Goals**
- [ ] Demo-ready system
- [ ] Presentation materials complete
- [ ] Video demonstration recorded
- [ ] Competition submission ready

---

**Remember: You're building something that will genuinely help rural students access better career opportunities. Make it count! 🌟**

*Questions? Ask your mentors or team members. We're all here to help you succeed!*