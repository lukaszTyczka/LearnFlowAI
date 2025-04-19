import React from "react";
import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";

export const HomePage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
            LearnFlow AI
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Your personal AI-powered learning assistant. Transform your notes
            into structured knowledge and interactive quizzes.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Button
              onClick={() => navigate("/login")}
              className="rounded-md px-6 py-5"
            >
              Get Started
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate("/about")}
              className="rounded-md px-6 py-5"
            >
              Learn More
            </Button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center">
            <h2 className="text-base font-semibold leading-7 text-indigo-600">
              Learn Faster
            </h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Everything you need to accelerate your learning
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
              {features.map((feature) => (
                <div key={feature.name} className="flex flex-col">
                  <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                    {feature.name}
                  </dt>
                  <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                    <p className="flex-auto">{feature.description}</p>
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
};

const features = [
  {
    name: "AI-Powered Summaries",
    description:
      "Transform lengthy notes into concise, easy-to-understand summaries using advanced AI technology.",
  },
  {
    name: "Interactive Learning",
    description:
      "Generate custom quizzes and flashcards to test your knowledge and reinforce learning.",
  },
  {
    name: "Smart Organization",
    description:
      "Automatically categorize and organize your learning materials for efficient review and reference.",
  },
];
