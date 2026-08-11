import type { Workflow } from "../schema/workflow.js";

export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  accent: string;
  workflow: Workflow;
}

export const WORKFLOW_TEMPLATES: WorkflowTemplate[] = [
  {
    id: "internship-apply",
    name: "Internship Application",
    description:
      "From finding a role to offer — track resume screening, assignments, interviews, and follow-ups.",
    category: "Career",
    icon: "briefcase",
    accent: "#38bdf8",
    workflow: {
      name: "Internship Application",
      description: "Student pipeline for applying to internships and web dev roles",
      nodes: [
        {
          id: "n1",
          type: "trigger",
          label: "Application Submitted",
          config: { event: "career.application.submitted" },
          position: { x: 250, y: 0 },
        },
        {
          id: "n2",
          type: "ai_classify",
          label: "Match Role Fit",
          config: { field: "jobDescription", categories: ["strong", "partial", "stretch"] },
          position: { x: 250, y: 110 },
        },
        {
          id: "n3",
          type: "condition",
          label: "Resume Keywords OK?",
          config: { field: "atsScore", operator: "gte", value: 70 },
          position: { x: 250, y: 220 },
        },
        {
          id: "n4",
          type: "action",
          label: "Tailor Resume & Reapply",
          config: { channel: "notion", template: "Update projects section for this JD" },
          position: { x: 480, y: 330 },
        },
        {
          id: "n5",
          type: "action",
          label: "Send Thank-You / Follow-Up",
          config: { channel: "email", template: "Polite follow-up after 7 days" },
          position: { x: 80, y: 330 },
        },
        {
          id: "n6",
          type: "condition",
          label: "Take-Home Assigned?",
          config: { field: "stage", operator: "equals", value: "assignment" },
          position: { x: 80, y: 440 },
        },
        {
          id: "n7",
          type: "delay",
          label: "Block Build Time",
          config: { duration: "3d" },
          position: { x: 80, y: 550 },
        },
        {
          id: "n8",
          type: "action",
          label: "Submit GitHub + README",
          config: { channel: "form", template: "Repo link, demo video, setup steps" },
          position: { x: 80, y: 660 },
        },
        {
          id: "n9",
          type: "escalate",
          label: "Schedule Interview",
          config: { assignTo: "recruiter-calendar" },
          position: { x: 250, y: 550 },
        },
      ],
      edges: [
        { id: "e1", source: "n1", target: "n2" },
        { id: "e2", source: "n2", target: "n3" },
        { id: "e3", source: "n3", target: "n5", label: "true" },
        { id: "e4", source: "n3", target: "n4", label: "false" },
        { id: "e5", source: "n5", target: "n6" },
        { id: "e6", source: "n6", target: "n7", label: "true" },
        { id: "e7", source: "n6", target: "n9", label: "false" },
        { id: "e8", source: "n7", target: "n8" },
      ],
    },
  },
  {
    id: "project-submit",
    name: "Semester Project Submission",
    description:
      "Capstone or lab project — draft, peer review, plagiarism check, mentor sign-off, final upload.",
    category: "Academics",
    icon: "book",
    accent: "#a78bfa",
    workflow: {
      name: "Semester Project Submission",
      description: "End-to-end flow for submitting a major course or final-year project",
      nodes: [
        {
          id: "n1",
          type: "trigger",
          label: "Submission Window Opens",
          config: { event: "lms.deadline.open" },
          position: { x: 250, y: 0 },
        },
        {
          id: "n2",
          type: "action",
          label: "Run Local Tests & Lint",
          config: { channel: "cli", template: "npm test && npm run build" },
          position: { x: 250, y: 110 },
        },
        {
          id: "n3",
          type: "condition",
          label: "All Tests Pass?",
          config: { field: "ciStatus", operator: "equals", value: "pass" },
          position: { x: 250, y: 220 },
        },
        {
          id: "n4",
          type: "action",
          label: "Fix Failures",
          config: { channel: "ide", template: "Debug and re-run before upload" },
          position: { x: 480, y: 330 },
        },
        {
          id: "n5",
          type: "action",
          label: "Upload Report + Code Zip",
          config: { channel: "lms", template: "PDF report + source archive" },
          position: { x: 80, y: 330 },
        },
        {
          id: "n6",
          type: "ai_classify",
          label: "Check Rubric Sections",
          config: { field: "report", categories: ["complete", "missing-demo", "missing-docs"] },
          position: { x: 80, y: 440 },
        },
        {
          id: "n7",
          type: "condition",
          label: "Plagiarism Below Limit?",
          config: { field: "similarityPercent", operator: "lt", value: 15 },
          position: { x: 80, y: 550 },
        },
        {
          id: "n8",
          type: "escalate",
          label: "Mentor Review",
          config: { assignTo: "project-guide" },
          position: { x: 250, y: 660 },
        },
        {
          id: "n9",
          type: "action",
          label: "Mark Final Submission",
          config: { channel: "lms", template: "Confirm before hard deadline" },
          position: { x: 80, y: 770 },
        },
      ],
      edges: [
        { id: "e1", source: "n1", target: "n2" },
        { id: "e2", source: "n2", target: "n3" },
        { id: "e3", source: "n3", target: "n5", label: "true" },
        { id: "e4", source: "n3", target: "n4", label: "false" },
        { id: "e5", source: "n4", target: "n2" },
        { id: "e6", source: "n5", target: "n6" },
        { id: "e7", source: "n6", target: "n7" },
        { id: "e8", source: "n7", target: "n9", label: "true" },
        { id: "e9", source: "n7", target: "n8", label: "false" },
      ],
    },
  },
  {
    id: "hackathon",
    name: "Hackathon Weekend",
    description:
      "Team idea → roles → build sprints → demo prep — stay on track before the submission timer ends.",
    category: "Events",
    icon: "rocket",
    accent: "#f472b6",
    workflow: {
      name: "Hackathon Weekend",
      description: "Lightweight process map for a 24–48h student hackathon team",
      nodes: [
        {
          id: "n1",
          type: "trigger",
          label: "Theme Announced",
          config: { event: "hackathon.kickoff" },
          position: { x: 250, y: 0 },
        },
        {
          id: "n2",
          type: "action",
          label: "Brainstorm & Pick Idea",
          config: { channel: "whiteboard", template: "Problem, user, MVP scope in 1 page" },
          position: { x: 250, y: 110 },
        },
        {
          id: "n3",
          type: "action",
          label: "Split Roles",
          config: { assignTo: "team", template: "Frontend, backend, slides, demo script" },
          position: { x: 250, y: 220 },
        },
        {
          id: "n4",
          type: "delay",
          label: "Build Sprint 1",
          config: { duration: "8h" },
          position: { x: 250, y: 330 },
        },
        {
          id: "n5",
          type: "condition",
          label: "MVP Demoable?",
          config: { field: "featureComplete", operator: "equals", value: true },
          position: { x: 250, y: 440 },
        },
        {
          id: "n6",
          type: "action",
          label: "Cut Scope — Ship Core",
          config: { channel: "chat", template: "Drop nice-to-haves, keep one wow moment" },
          position: { x: 480, y: 550 },
        },
        {
          id: "n7",
          type: "action",
          label: "Record Demo Video",
          config: { channel: "drive", template: "2-min walkthrough + GitHub link" },
          position: { x: 80, y: 550 },
        },
        {
          id: "n8",
          type: "delay",
          label: "Buffer Before Deadline",
          config: { duration: "1h" },
          position: { x: 80, y: 660 },
        },
        {
          id: "n9",
          type: "action",
          label: "Submit to Portal",
          config: { channel: "form", template: "Repo, deck, video, team list" },
          position: { x: 80, y: 770 },
        },
      ],
      edges: [
        { id: "e1", source: "n1", target: "n2" },
        { id: "e2", source: "n2", target: "n3" },
        { id: "e3", source: "n3", target: "n4" },
        { id: "e4", source: "n4", target: "n5" },
        { id: "e5", source: "n5", target: "n7", label: "true" },
        { id: "e6", source: "n5", target: "n6", label: "false" },
        { id: "e7", source: "n6", target: "n4" },
        { id: "e8", source: "n7", target: "n8" },
        { id: "e9", source: "n8", target: "n9" },
      ],
    },
  },
];
