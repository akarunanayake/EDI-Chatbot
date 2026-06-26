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
