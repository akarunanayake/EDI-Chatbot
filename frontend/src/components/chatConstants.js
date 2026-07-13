export const FILE_TYPE_OPTIONS = [
  { label: "Lesson Plan", value: "lesson_plan", icon: "📚" },
  { label: "EDI Supporting Document", value: "supporting_document", icon: "📄" },
];

export const SUPPORT_OPTIONS = [
  {
    label: "Integrate EDI principles into my lesson plan",
    value: "1",
  },
  {
    label: "Include better examples or datasets",
    value: "2",
  },
  {
    label: "Design an EDI-integrated assignment",
    value: "3",
  },
  {
    label: "Include reflective questions",
    value: "4",
  },
  {
    label: "Evaluate lesson plan for EDI",
    value: "5",
  },
  {
    label: "Something else",
    value: "6",
  },
];

export const SUPPORT_PROMPTS = {
  "1": `Please review my lesson plan (level {undergraduate/postgraduate}). Learning outcomes: {learning_outcomes}. Suggest concrete, actionable ways to integrate Equity, Diversity & Inclusion across objectives, materials, activities, and assessments. Emphasise representation, Universal Design for Learning (accessibility & multiple means), restorative facilitation, and anti-bias language. Return: (1) 3-5 quick wins I can apply now, (2) one rewritten activity or script (teacher + student prompts), (3) teacher notes for facilitation and differentiation, and (4) suggested resources and sample assessment adjustments.`,
  "2": `I need classroom-ready examples or a sample dataset for my lesson plan that reflect diverse perspectives across {dimensions, e.g., culture, gender, socioeconomic status, disability}. Provide: a schema, 8-12 sample rows with realistic, non-stereotyped values, notes on possible bias/sensitivity, guidance on anonymisation and consent where relevant, and 2 classroom activities showing how to use the dataset to teach content while foregrounding EDI.`,
  "3": `Design an assignment for my lesson plan aligned to learning outcomes {learning_outcomes}. Include: assignment brief, explicit EDI learning objectives, scaffolded steps, UDL-accessibility supports, suggested group roles and restorative protocols, a rubric with EDI-aligned criteria (representation, accessibility, fairness), differentiation strategies, estimated time, and one sample student response.`,
  "4": `Generate reflective prompts and a short activity for students in my lesson plan to explore EDI themes. Provide: 6-10 starter questions (individual + small-group), a 10-15 minute reflective activity with facilitator notes, guidance for safe discussion and restorative framing, and examples of expected student responses across levels of depth.`,
  "5": `Audit my lesson plan against criteria: representation, accessibility/UDL, inclusive language, assessment equity, student agency, and classroom safety. For each criterion give: a 1-5 rating, a concise justification, 2 specific improvements (one immediate, one strategic), and a checklist of actionable changes to update the lesson plan.`,
  "6": `I need help with: {describe_need}. Context: lesson title "{lesson_title}", level {undergraduate/postgraduate}, constraints {time/tech/class-size}, and desired outcome {what_you_want}. Provide: tailored step-by-step suggestions, sample materials or prompts, accessibility considerations, a short teacher script for rollout, and recommended next actions.`,
};

export const SUPPORT_PROMPT_CONTEXT = {
  lessonPlan: "If you have uploaded a lesson plan, it will automatically be used as context. If you haven't uploaded a lesson plan, please briefly describe your lesson or teaching context in your prompt.",
  supportingDocuments: "If you have uploaded any supporting documents that are relevant to your request, mention in your prompt how you would like the chatbot to use them."
}

export const SUPPORT_PROMPT_GUIDANCE = {
  "1": {
    title: "Integrate EDI Principles into My Lesson Plan",
    description: "Improve your lesson plan by incorporating Equity, Diversity and Inclusion (EDI) principles while maintaining the intended learning outcomes.",
    tips: [
      "Describe the improvements you would like to make (e.g., teaching activities, learning resources, accessibility, inclusive language, student participation, or representation of diverse perspectives).",
      "Mention any specific EDI goals or concerns (e.g., improving accessibility, increasing cultural representation, reducing bias, or creating more inclusive learning experiences)."
    ],
    samplePrompt: "Please review my lesson plan and recommend practical ways to better integrate Equity, Diversity and Inclusion (EDI) principles. Suggest improvements to teaching activities, learning resources, accessibility, inclusive language, student participation, and representation where appropriate while maintaining the intended learning outcomes."
  },
  "2": {
    title: "Include Better Examples or Datasets",
    description: "Replace or enhance lesson examples, case studies, scenarios, or datasets to better represent diverse perspectives and support inclusive learning.",
    tips: [
      "Describe what you would like to improve (e.g., examples, datasets, case studies, scenarios, demonstrations, or learning resources).",
      "Mention the kinds of perspectives you would like represented (e.g., different cultures, genders, abilities, industries, communities, socioeconomic backgrounds, or global contexts)."
    ],
    samplePrompt: "Please review my lesson plan and recommend more inclusive examples, datasets, case studies, scenarios, or learning resources where appropriate. Ensure the recommendations represent diverse perspectives while remaining relevant to the lesson objectives."
  },
  "3": {
    title: "Design an EDI-Integrated Assignment",
    description: "Create or improve an assessment that aligns with your lesson while embedding Equity, Diversity and Inclusion (EDI) principles.",
    tips: [
      "Describe the type of assessment you need (e.g., individual assignment, group project, presentation, practical activity, quiz, or reflection).",
      "Mention any assessment requirements or constraints (e.g., learning outcomes, grading criteria, duration, or assessment format).",
    ],
    samplePrompt: "Please design or improve an assessment for this lesson that integrates Equity, Diversity and Inclusion (EDI) principles. Ensure it aligns with the lesson learning outcomes and promotes inclusion, accessibility, fairness, and diverse perspectives."
  },
  "4": {
    title: "Include Reflective Questions",
    description: "Generate reflective questions that encourage students to critically engage with Equity, Diversity and Inclusion (EDI) concepts related to the lesson.",
    tips: [
      "Describe what students should reflect on (e.g., ethical issues, bias, inclusion, accessibility, professional practice, or multiple perspectives).",
      "Mention the type of reflection you want (e.g., discussion questions, individual reflection, classroom activity, or assessment questions).",
    ],
    samplePrompt: "Please generate reflective questions for this lesson that encourage students to critically consider Equity, Diversity and Inclusion (EDI) in relation to the lesson content. The questions should promote critical thinking, ethical reasoning, multiple perspectives, and inclusive practice."
  },
  "5": {
    title: "Evaluate Lesson Plan for EDI",
    description: "Review your lesson plan and identify strengths, gaps, and opportunities to improve Equity, Diversity and Inclusion (EDI).",
    tips: [
      "Describe the type of feedback you would like (e.g., overall review, accessibility, representation, teaching strategies, learning activities, assessments, or inclusive language).",
      "Mention any areas you are particularly concerned about (e.g., bias, accessibility, cultural representation, or student engagement).",
    ],
    samplePrompt: "Please evaluate my lesson plan from an Equity, Diversity and Inclusion (EDI) perspective. Identify strengths, potential gaps, and opportunities for improvement across teaching strategies, learning activities, assessments, accessibility, representation, and inclusive language. Where appropriate. Provide practical recommendations and explain the reasoning behind each suggestion."
  },
  "6": {
    title: "Request Custom EDI Support",
    description: "Request any other EDI-related teaching support that is not covered by the previous options.",
    tips: [
      "Clearly describe what you would like the chatbot to help you with (e.g., redesigning a learning activity, creating teaching resources, reviewing content, or answering an EDI-related teaching question).",
      "Explain the outcome you are hoping to achieve (e.g., improve student engagement, enhance accessibility, align with policy, or increase representation).",
    ],
    samplePrompt: "I would like assistance with the following EDI-related teaching task: [Describe your request here.] Provide practical, evidence-informed recommendations that support inclusive teaching while maintaining the intended learning outcomes. Explain the reasoning behind your recommendations."
  },
};
