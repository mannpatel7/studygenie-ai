# AI Chatbot - Testing & Verification Guide

## ✅ Pre-Launch Checklist

### Environment Setup
- [ ] `.env` file created with `OPENROUTER_API_KEY`
- [ ] `OPENROUTER_API_KEY` is valid and has credits
- [ ] `PORT` set to 5000 (or your preferred port)

### Dependencies
- [ ] Backend: `npm install` completed in `/backend` folder
- [ ] `package.json` includes: express, cors, dotenv, node-fetch
- [ ] Frontend: All dependencies up to date
- [ ] No warnings in npm install output

### File Creation
- [ ] `backend/services/chatService.js` exists
- [ ] `src/pages/Chat.tsx` exists
- [ ] Routes and controllers updated

### Navigation
- [ ] `/chat` route added to App.tsx
- [ ] Chat menu item appears in sidebar with MessageSquare icon
- [ ] Navigation works after login

---

## 🚀 Launch Checklist

### Backend
```bash
cd backend
npm run dev
```
- [ ] No errors on startup
- [ ] Message: "Server running on port 5000"
- [ ] CORS enabled
- [ ] /api/chat endpoint accessible

### Frontend
```bash
npm run dev
```
- [ ] No TypeScript errors
- [ ] Dev server starts
- [ ] App loads on http://localhost:5173

### Integration
- [ ] Can login successfully
- [ ] Chat appears in navigation
- [ ] Can navigate to /chat page

---

## 🧪 Feature Testing

### Feature 1: Basic Chat Messages
**Steps:**
1. Navigate to Chat page
2. Type: `What is photosynthesis?`
3. Click Send

**Expected Result:**
- ✅ Message appears in blue bubble on right
- ✅ Loading spinner appears
- ✅ AI response appears in gray bubble on left
- ✅ Response is a clear explanation
- ✅ Both have timestamps

**Debug if failing:**
- [ ] Check browser console for errors
- [ ] Verify `/api/chat` is implemented
- [ ] Check backend is running
- [ ] Verify OpenRouter API key is correct

---

### Feature 2: Context-Based Questions
**Steps:**
1. Click "📄 Add Context" button
2. Paste this text:
   ```
   The mitochondria is the powerhouse of the cell. 
   It produces ATP through cellular respiration, 
   converting glucose into usable energy for the cell.
   ```
3. Type: `What produces ATP?`
4. Send

**Expected Result:**
- ✅ Context input box shows
- ✅ Message explains ATP is produced in mitochondria
- ✅ Answer is based ONLY on provided text
- ✅ Context counter shows context is active

**Debug if failing:**
- [ ] Check `context` parameter is sent in request
- [ ] Verify system prompt includes context
- [ ] Check that AI uses provided material only

---

### Feature 3: "Not Found in Context"
**Steps:**
1. Keep context from Feature 2
2. Type: `What is photosynthesis?`
3. Send

**Expected Result:**
- ✅ AI responds that answer is not in provided material
- ✅ Suggests providing more context

**Debug if failing:**
- [ ] Verify system prompt is enforcing context-only answers
- [ ] Check OpenRouter is returning error properly

---

### Feature 4: Clear Context
**Steps:**
1. With context active, click "Clear" button
2. Type: `What is photosynthesis?`
3. Send

**Expected Result:**
- ✅ Context input hides
- ✅ AI provides general knowledge answer
- ✅ Not limited to previous context

---

### Feature 5: New Chat Button
**Steps:**
1. Send several messages
2. Click "New Chat" button

**Expected Result:**
- ✅ All messages cleared
- ✅ Initial greeting message returns
- ✅ Context cleared
- ✅ Input box empty
- ✅ No errors

---

### Feature 6: Long Messages
**Steps:**
1. Type a very long question (200+ characters)
2. Send

**Expected Result:**
- ✅ Message wraps properly
- ✅ Response displays fully
- ✅ No truncation issues
- ✅ Auto-scrolls to bottom

---

### Feature 7: Keyboard Shortcuts
**Steps:**
1. Click input box
2. Type: `Test message`
3. Press Enter

**Expected Result:**
- ✅ Message sends immediately
- ✅ No newline added

**Then:**
1. Type: `Line 1`
2. Press Shift+Enter
3. Type: `Line 2`
4. Press Enter

**Expected Result:**
- ✅ Newline added in message
- ✅ Full message sends on Enter

---

### Feature 8: Loading State
**Steps:**
1. Send a message
2. While loading spinner shows, try:
   - Send another message
   - Type in context box

**Expected Result:**
- ✅ Send button disabled while loading
- ✅ Can't send duplicate requests
- ✅ Input box grayed out/disabled
- ✅ "AI is thinking..." message shows

---

### Feature 9: Error Handling
**Steps:**
1. Stop backend server
2. Try to send a message
3. Check error display

**Expected Result:**
- ✅ Error message appears in alert box
- ✅ Error is user-friendly
- ✅ App doesn't crash
- ✅ Can still interact (after restarting backend)

---

### Feature 10: Dark Mode
**Steps:**
1. Toggle dark mode in header
2. Send messages

**Expected Result:**
- ✅ Chat bubbles adapt to dark mode
- ✅ Background gradient changes
- ✅ Text remains readable
- ✅ No visibility issues

---

### Feature 11: Responsive Design
**Steps:**
1. On desktop: Full layout works
2. On tablet (iPad): Sidebar responsive
3. On mobile: Sidebar collapses, hamburger menu works

**Expected Result:**
- ✅ Desktop: Sidebar visible, full width chat
- ✅ Tablet: Responsive spacing
- ✅ Mobile: Hamburger menu for sidebar
- ✅ All buttons reachable
- ✅ Chat bubbles stack properly

---

### Feature 12: Message Timestamps
**Steps:**
1. Send messages 2 minutes apart
2. Look at timestamps

**Expected Result:**
- ✅ Each message has timestamp
- ✅ Format: HH:MM (12-hour or 24-hour)
- ✅ Updates correctly for newer messages

---

### Feature 13: Stats Tracking
**Steps:**
1. Send 3 messages
2. Go to Dashboard
3. Check activity feed

**Expected Result:**
- ✅ "Had a chat with AI tutor" entries appear
- ✅ Count matches: 3 messages = 3 entries
- ✅ Time shows "just now"

---

## 🛠️ API Testing (Using cURL or Postman)

### Test with cURL

**Normal Question:**
```bash
curl -X POST http://localhost:5000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Explain gravity"
  }'
```

**Expected Response:**
```json
{
  "response": "Gravity is a fundamental force..."
}
```

**With Context:**
```bash
curl -X POST http://localhost:5000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "What is mentioned?",
    "context": "The Earth orbits the Sun..."
  }'
```

---

## 📊 Performance Testing

### Test 1: Response Time
- [ ] Normal response: < 10 seconds
- [ ] Long context: < 15 seconds
- [ ] No timeout errors

### Test 2: Multiple Users
- [ ] Open chat in 2 browser windows
- [ ] Send messages simultaneously
- [ ] Both receive responses independently

### Test 3: Memory
- [ ] Send 50 messages
- [ ] App remains responsive
- [ ] No memory leaks
- [ ] Scrolling smooth

---

## 🐛 Troubleshooting Guide

### Problem: "Failed to get response from AI"

**Check 1: OpenRouter API Key**
```bash
# Verify key is in .env
cat .env | grep OPENROUTER_API_KEY
```

**Check 2: Backend Running**
```bash
# Port 5000 should be listening
netstat -ano | findstr :5000  # Windows
lsof -i :5000  # Mac/Linux
```

**Check 3: API Quotas**
- Go to https://openrouter.ai/keys
- Verify key has remaining credits
- Free tier has limits!

---

### Problem: 404 - /api/chat not found

**Check:**
- [ ] Backend route file updated
- [ ] Import statement correct
- [ ] `npm install` completed
- [ ] Backend restarted after changes

**Fix:**
```bash
cd backend
npm install
npm run dev  # Restart
```

---

### Problem: Context not working

**Check:**
1. Click "📄 Add Context" - should show input
2. Paste text in textarea
3. Send message - should include context in request

**Debug in Browser DevTools:**
1. Open Networks tab
2. Click "Add Context"
3. Send message
4. Check POST `/api/chat` request body
5. Should include `"context": "your text..."`

---

### Problem: Dark mode styling issues

**Check CSS:**
```css
/* Should have dark: classes */
dark:bg-slate-700
dark:text-white
dark:border-slate-600
```

**Fix:**
- Update Tailwind CSS config
- Rebuild frontend
- Hard refresh browser (Ctrl+Shift+R)

---

### Problem: Messages not scrolling to bottom

**Check:**
```javascript
// Should auto-scroll on new messages
useEffect(() => {
  scrollToBottom();
}, [messages]);
```

**If broken:**
- Check React.useEffect dependency array
- Verify `messagesEndRef` element exists
- Verify unique `key` prop on messages

---

## 📝 Sample Test Conversations

### Test 1: General Knowledge
```
User: What is the capital of France?
AI: The capital of France is Paris...
```

### Test 2: Study Help
```
User: How do I solve quadratic equations?
AI: To solve quadratic equations, you can use...
```

### Test 3: With Lecture Notes
```
Context: "Chapter 5: Photosynthesis converts light energy
into chemical energy through the Calvin Cycle..."

User: What does photosynthesis do?
AI: Based on the provided material, photosynthesis converts...
```

### Test 4: Context Not Available
```
Context: "The Great Wall was built in China..."

User: Who was Napoleon?
AI: I couldn't find the answer to your question in the 
provided material...
```

---

## ✨ Success Indicators

Your chatbot is working correctly when:

✅ Can send and receive messages
✅ AI responses are relevant and helpful
✅ Context mode limits answers to provided text
✅ Loading state works
✅ Errors handled gracefully
✅ Messages preserved until "New Chat"
✅ Works on mobile and desktop
✅ Dark mode supported
✅ Stats tracked in dashboard
✅ Timestamps accurate
✅ No console errors

---

## 📞 Need Help?

**Check logs:**
- Backend: Terminal output from `npm run dev`
- Frontend: Browser DevTools Console (F12)
- API: DevTools Network tab

**Common issues:**
1. API Key invalid → Get new one from openrouter.ai
2. Dependency missing → Run `npm install`
3. Port in use → Change PORT in .env
4. CORS errors → Verify cors middleware in server.js

Good luck! 🚀
