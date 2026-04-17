export interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswerIndex: number;
  points: number;
  tip?: string;
  tipPenalty: number; // Câte puncte se scad dacă folosește indiciul
}

export interface TestData {
  id: string;
  title: string;
  description: string;
  topic: string;
  durationMinutes: number;
  questions: Question[];
}

// Date de probă pentru a testa UI-ul
export const mockTests: TestData[] = [
  {
    id: "t1",
    title: "Algoritmi Fundamentali",
    description: "Testează-ți cunoștințele despre sortări, căutări și complexitate.",
    topic: "Computer Science",
    durationMinutes: 10,
    questions: [
      {
        id: "q1",
        text: "Care este complexitatea de timp pentru Binary Search în cel mai rău caz?",
        options: ["O(1)", "O(n)", "O(log n)", "O(n^2)"],
        correctAnswerIndex: 2,
        points: 10,
        tip: "Gândește-te la cum se înjumătățește intervalul de căutare la fiecare pas.",
        tipPenalty: 3,
      },
      {
        id: "q2",
        text: "Ce structură de date folosește principiul LIFO?",
        options: ["Queue", "Stack", "Tree", "Graph"],
        correctAnswerIndex: 1,
        points: 10,
        tip: "LIFO înseamnă Last In, First Out.",
        tipPenalty: 2,
      }
    ]
  }
];