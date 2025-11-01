# 🔄 AI Classification Flow Diagram

## Visual Flow

```
┌─────────────────────────────────────────────────────────────┐
│                   USER SUBMITS REPORT                        │
│                                                              │
│  • Title: "Large pothole on Main Street"                    │
│  • Description: "Dangerous pothole causing accidents"       │
│  • Images: [pothole.jpg] (optional)                         │
│  • Category: "Road Service Department" (optional)           │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│              STEP 1: CHECK USER SELECTION                    │
└─────────────────────────────────────────────────────────────┘
                            ↓
                    Did user select
                     category?
                            ↓
        ┌───────────────────┴───────────────────┐
        │                                       │
       YES                                     NO
        │                                       │
        ↓                                       ↓
┌──────────────────┐              ┌────────────────────────────┐
│  USE USER'S      │              │  STEP 2: CHECK IMAGES      │
│  SELECTION       │              └────────────────────────────┘
│                  │                           ↓
│ ✅ Category:     │                   Did user upload
│    User Choice   │                      images?
│                  │                           ↓
│ ✅ Confidence:   │          ┌────────────────┴────────────────┐
│    100%          │          │                                 │
│                  │         YES                               NO
│ ✅ AI: BYPASSED  │          │                                 │
│                  │          ↓                                 ↓
│ 👤 Log:          │  ┌──────────────────┐      ┌──────────────────────┐
│ "User manually   │  │  USE TRAINED     │      │  USE TEXT            │
│  selected"       │  │  AI MODEL        │      │  CLASSIFICATION      │
└──────────────────┘  └──────────────────┘      └──────────────────────┘
                               ↓                              ↓
                      ┌─────────────────┐         ┌──────────────────┐
                      │ Check if model  │         │ Analyze title +  │
                      │   is trained?   │         │   description    │
                      └─────────────────┘         │                  │
                               ↓                  │ Use OpenAI or    │
                  ┌────────────┴────────────┐     │ rule-based       │
                  │                         │     │ classification   │
                 YES                       NO     │                  │
                  │                         │     │ 📝 Log:          │
                  ↓                         │     │ "Using text-     │
         ┌──────────────────┐              │     │  based"          │
         │ Predict image    │              │     └──────────────────┘
         │ with model       │              │
         └──────────────────┘              │
                  ↓                         │
         ┌──────────────────┐              │
         │ Success?         │              │
         └──────────────────┘              │
                  ↓                         │
      ┌───────────┴───────────┐            │
      │                       │            │
     YES                     NO            │
      │                       │            │
      ↓                       ↓            ↓
┌──────────────┐    ┌────────────────────────┐
│ MAP TO DEPT  │    │  FALLBACK TO TEXT      │
│              │    │  CLASSIFICATION        │
│ Pothole →    │    │                        │
│ Road Service │    │  ⚠️ Log:               │
│              │    │  "Model failed" or     │
│ Littering →  │    │  "Model not available" │
│ General      │    └────────────────────────┘
│              │
│ 🤖 Log:      │
│ "AI model    │
│  detected:   │
│  Pothole"    │
└──────────────┘
       ↓
┌──────────────────────────────────────────────────────────────┐
│                    FINAL RESULT                              │
│                                                              │
│  • Category: [Determined by priority logic]                 │
│  • Department: [Mapped from category]                       │
│  • Priority: [Based on confidence or keywords]              │
│  • Confidence: [0.0 - 1.0]                                  │
│  • Reasoning: [Why this classification was chosen]          │
└──────────────────────────────────────────────────────────────┘
       ↓
┌──────────────────────────────────────────────────────────────┐
│              SAVE TO DATABASE                                │
│                                                              │
│  Collection: [department]_reports                           │
│  Status: open                                               │
│  AI Metadata: {                                             │
│    suggestedCategory,                                       │
│    suggestedPriority,                                       │
│    confidence,                                              │
│    reasoning                                                │
│  }                                                          │
└──────────────────────────────────────────────────────────────┘
```

## 🎯 Priority Logic Summary

| Condition | Action | AI Model Used? | Confidence |
|-----------|--------|----------------|------------|
| User selects category | Use user's choice | ❌ NO | 100% |
| Images + No selection | Use trained AI model | ✅ YES | 60-99% |
| No images + No selection | Use text classification | ❌ NO | 50-95% |
| Model fails | Fallback to text | ⚠️ ATTEMPTED | 50-95% |
| Model not trained | Fallback to text | ⚠️ ATTEMPTED | 50-95% |

## 📊 Example Flows

### Example 1: User Knows Best
```
Input:
  Title: "Pothole on Main St"
  Images: [pothole.jpg]
  Category: "Hospital Emergency" ← User selected

Flow:
  Step 1: User selected? YES
  → Use "Hospital Emergency"
  → AI Model: BYPASSED
  → Confidence: 100%

Output:
  Category: "Hospital Emergency"
  Department: hospital_emergency
  Reasoning: "User-selected category"
```

### Example 2: AI Assists User
```
Input:
  Title: "Pothole on Main St"
  Images: [pothole.jpg]
  Category: (empty) ← User didn't select

Flow:
  Step 1: User selected? NO
  Step 2: Has images? YES
  → Check model availability
  → Model available? YES
  → Predict image
  → Success: "Pothole Issues" (94% confidence)
  → Map to "Road Service Department"

Output:
  Category: "Road Service Department"
  Department: road_service
  Priority: high (confidence ≥ 85%)
  Reasoning: "Trained AI model detected: Pothole Issues (94.0% confidence)"
```

### Example 3: Text-Only Report
```
Input:
  Title: "Street light not working"
  Images: (none)
  Category: (empty)

Flow:
  Step 1: User selected? NO
  Step 2: Has images? NO
  → Use text classification
  → Analyze keywords
  → Detect "street light" → Electrical

Output:
  Category: "Electrical Service Department"
  Department: electrical_service
  Priority: medium
  Reasoning: "Rule-based classification: 3 keyword matches"
```

## 🛡️ Error Handling

```
Try: Use Trained AI Model
  ├─ Model not trained → Fallback to text
  ├─ Image file not found → Fallback to text
  ├─ Prediction fails → Fallback to text
  ├─ Python error → Fallback to text
  └─ Any exception → Fallback to text

Result: System ALWAYS works! ✅
```

## 🎓 Key Principles

1. **User Choice First**: Manual selection always wins
2. **AI Assistance**: Automatic when user doesn't know
3. **Visual Evidence**: Images analyzed by trained model
4. **Graceful Degradation**: Multiple fallback layers
5. **Never Fail**: System always produces a classification

---

**This flow ensures the best user experience while leveraging AI when helpful!** 🚀
