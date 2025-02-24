"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Confetti from "react-confetti";
import { Stethoscope, Microscope, Beaker } from "lucide-react";

interface Question {
  question: string;
  options: string[];
  answer: string;
  icon: React.ReactElement;
}

const questions: Question[] = [
  {
    question: "Which science field focuses on healthcare and developing new medicines?",
    options: ["Physical Sciences", "Medical Science", "Biological Sciences", "Earth Sciences"],
    answer: "Medical Science",
    icon: <Stethoscope className="w-8 h-8 text-blue-500" />,
  },
  {
    question: "What is the study of fungi called?",
    options: ["Botany", "Zoology", "Mycology", "Entomology"],
    answer: "Mycology",
    icon: <Microscope className="w-8 h-8 text-green-500" />,
  },
  {
    question: "Which field focuses on food production and sustainable farming?",
    options: ["Geology", "Astronomy", "Meteorology", "Agricultural Sciences"],
    answer: "Agricultural Sciences",
    icon: <Beaker className="w-8 h-8 text-yellow-500" />,
  },
];

interface LeaderboardEntry {
  name: string;
  score: number;
  time: string;
}

export default function KahootQuiz() {
  // Mounted flag to ensure client-only code runs after mount
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  // Username state and load from localStorage after mounting
  const [username, setUsername] = useState<string>("");
  const [nameInput, setNameInput] = useState<string>("");

  useEffect(() => {
    const storedName = localStorage.getItem("username") || "";
    setUsername(storedName);
  }, []);

  const [currentQuestion, setCurrentQuestion] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [showScore, setShowScore] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number>(10);
  const [confetti, setConfetti] = useState<boolean>(false);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    if (showScore) {
      setConfetti(true);
      setTimeout(() => setConfetti(false), 5000);
      updateLeaderboard();
    }
  }, [showScore]);

  useEffect(() => {
    if (!showScore) {
      if (timeLeft > 0) {
        const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
        return () => clearTimeout(timer);
      } else {
        handleNextQuestion();
      }
    }
  }, [timeLeft, showScore]);

  const handleAnswerClick = (selectedAnswer: string) => {
    if (selectedAnswer === questions[currentQuestion].answer) {
      setScore(score + timeLeft);
    }
    handleNextQuestion();
  };

  const handleNextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setTimeLeft(10);
    } else {
      setShowScore(true);
    }
  };

  // Update the global leaderboard by sending a POST request to our API route
  const updateLeaderboard = async () => {
    const newEntry = { name: username, score, time: new Date().toLocaleString() };
    const res = await fetch("/api/leaderboard", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newEntry),
    });
    const updatedLeaderboard = await res.json();
    setLeaderboard(updatedLeaderboard);
  };

  // Optionally, you could fetch the global leaderboard on mount or when needed:
  const fetchLeaderboard = async () => {
    const res = await fetch("/api/leaderboard");
    const data = await res.json();
    setLeaderboard(data);
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setScore(0);
    setShowScore(false);
    setTimeLeft(10);
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-500 to-purple-500 p-4 text-white">
      {!username ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (nameInput.trim()) {
              setUsername(nameInput.trim());
              localStorage.setItem("username", nameInput.trim());
            }
          }}
          className="bg-white text-black rounded-xl shadow-2xl p-8 max-w-md w-full text-center"
        >
          <h2 className="text-2xl font-bold mb-4">Enter Your Name</h2>
          <input
            type="text"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            className="border p-2 w-full mb-4"
            placeholder="Your name"
          />
          <button
            type="submit"
            className="bg-green-500 hover:bg-green-600 transition-colors text-white px-6 py-3 rounded-full text-lg font-semibold"
          >
            Submit
          </button>
        </form>
      ) : (
        <div className="bg-white text-black rounded-xl shadow-2xl p-8 max-w-2xl w-full text-center">
          {showScore ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
              <h2 className="text-4xl font-bold mb-4">🎉 Quiz Complete! 🎉</h2>
              <p className="text-2xl mb-4">
                {username}, you scored {score} points
              </p>
              <h3 className="text-xl font-bold mt-4">Leaderboard</h3>
              <ul className="mt-2 text-lg">
                {leaderboard.map((entry, index) => (
                  <li key={index} className="border-b p-2">
                    {index + 1}. {entry.name} - {entry.score} points - {entry.time}
                  </li>
                ))}
              </ul>
              <button
                onClick={resetQuiz}
                className="mt-6 bg-green-500 hover:bg-green-600 transition-colors text-white px-8 py-3 rounded-full text-lg font-semibold"
              >
                Play Again
              </button>
            </motion.div>
          ) : (
            <>
              <h2 className="text-4xl font-bold mb-6">CSTEM Quiz:</h2>
              <motion.div
                key={currentQuestion}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <div className="flex items-center justify-center mb-4">
                  {questions[currentQuestion].icon}
                  <h3 className="text-2xl font-semibold ml-3">{questions[currentQuestion].question}</h3>
                </div>
                <div className="mb-4">
                  <p className="text-xl font-semibold">Time Left: {timeLeft}s</p>
                  <div className="w-full bg-gray-300 rounded-full h-4 mt-2">
                    <div
                      className="bg-green-500 h-4 rounded-full"
                      style={{ width: `${(timeLeft / 10) * 100}%` }}
                    ></div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {questions[currentQuestion].options.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => handleAnswerClick(option)}
                      className="bg-blue-100 hover:bg-blue-200 transition-colors text-black p-4 rounded-xl text-lg font-bold shadow-md"
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </motion.div>
            </>
          )}
          {confetti && <Confetti />}
        </div>
      )}
    </div>
  );
}
