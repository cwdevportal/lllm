'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

interface ResultData {
  total: number;
  correctCount: number;
  percentage: number;
  answers: {
    id: string;
    answer: string;
    isCorrect: boolean;
    question: {
      question: string;
      answer: string;
    };
  }[];
}

export default function ResultsPage() {
  const { studentId } = useParams();
  const [data, setData] = useState<ResultData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!studentId) return;

    const fetchResults = async () => {
      try {
        const res = await fetch(`/api/results/${studentId}`);
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error('Error fetching results:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [studentId]);

  if (loading) return <p className="p-6">Loading...</p>;
  if (!data) return <p className="p-6">No result data found.</p>;

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Student Result Summary</h1>

      <div className="bg-gray-100 rounded p-4">
        <p>Total Questions Answered: {data.total}</p>
        <p>Correct Answers: {data.correctCount}</p>
        <p>Score: <span className="font-semibold">{data.percentage}%</span></p>
      </div>

      <ul className="space-y-4">
        {data.answers.map((ans) => (
          <li key={ans.id} className="border rounded p-4">
            <p className="font-semibold">{ans.question.question}</p>
            <p className="mt-1">
              Your answer: <span className={ans.isCorrect ? 'text-green-600' : 'text-red-600'}>{ans.answer}</span>
            </p>
            {!ans.isCorrect && (
              <p className="text-sm text-gray-600">
                Correct answer: <span className="text-green-700">{ans.question.answer}</span>
              </p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
