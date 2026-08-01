import Papa from "papaparse";
import * as XLSX from "xlsx";
import { Quiz, QuizAttempt, Question } from "../types";

export function exportAttemptsToCSV(attempts: QuizAttempt[], quizTitle: string) {
  const data = attempts.map((att) => ({
    Attempt_ID: att.id,
    Student_Name: att.studentName,
    Student_Email: att.studentEmail,
    Quiz_Title: att.quizTitle,
    Status: att.status,
    Score: att.score,
    Total_Marks: att.totalMarks,
    Percentage: `${att.percentage}%`,
    Pass_Fail: att.isPassed ? "PASSED" : "FAILED",
    Time_Spent_Sec: att.timeSpentSeconds,
    Started_At: att.startedAt,
    Submitted_At: att.submittedAt || "N/A",
  }));

  const csv = Papa.unparse(data);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `${quizTitle.replace(/\s+/g, "_")}_Results_${Date.now()}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportAttemptsToExcel(attempts: QuizAttempt[], quizTitle: string) {
  const data = attempts.map((att) => ({
    "Attempt ID": att.id,
    "Student Name": att.studentName,
    "Student Email": att.studentEmail,
    "Quiz Title": att.quizTitle,
    Status: att.status,
    Score: att.score,
    "Total Marks": att.totalMarks,
    Percentage: att.percentage,
    "Pass/Fail": att.isPassed ? "PASSED" : "FAILED",
    "Time Spent (s)": att.timeSpentSeconds,
    "Started At": att.startedAt,
    "Submitted At": att.submittedAt || "N/A",
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Results");
  XLSX.writeFile(workbook, `${quizTitle.replace(/\s+/g, "_")}_Results.xlsx`);
}

export function exportQuestionsToTemplate() {
  const templateData = [
    {
      Question: "What is the capital of France?",
      Type: "MULTIPLE_CHOICE",
      "Option A": "Paris",
      "Option B": "Berlin",
      "Option C": "Madrid",
      "Option D": "Rome",
      "Correct Answer": "Option A",
      Marks: 2,
      Category: "Geography",
      Difficulty: "Beginner",
      Explanation: "Paris is the capital and most populous city of France.",
      Tags: "Europe, Capital, Geography",
    },
    {
      Question: "Recite the memory verse for the topic New Birth in Christ",
      Type: "SHORT_TEXT",
      "Option A": "",
      "Option B": "",
      "Option C": "",
      "Option D": "",
      "Correct Answer": "2 Corinthians 5:17 Therefore if any man be in Christ he is a new creature old things are passed away behold all things are become new",
      Marks: 5,
      Category: "Memory Verses",
      Difficulty: "Intermediate",
      Explanation: "Key recitation text",
      Tags: "Recitation, Bible, Memory Verse",
    },
    {
      Question: "Select all primary colors:",
      Type: "MULTIPLE_RESPONSE",
      "Option A": "Red",
      "Option B": "Blue",
      "Option C": "Yellow",
      "Option D": "Green",
      "Correct Answer": "Option A, Option B, Option C",
      Marks: 3,
      Category: "Art",
      Difficulty: "Beginner",
      Explanation: "Red, Blue, and Yellow are the traditional primary colors.",
      Tags: "Art, Colors",
    },
    {
      Question: "The sun rises in the east.",
      Type: "TRUE_FALSE",
      "Option A": "True",
      "Option B": "False",
      "Option C": "",
      "Option D": "",
      "Correct Answer": "True",
      Marks: 1,
      Category: "Science",
      Difficulty: "Beginner",
      Explanation: "Earth rotates from west to east.",
      Tags: "Astronomy",
    },
  ];

  const worksheet = XLSX.utils.json_to_sheet(templateData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Import_Template");
  XLSX.writeFile(workbook, `Quiz_Questions_Import_Template.xlsx`);
}
