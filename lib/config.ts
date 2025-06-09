import {
  CodeIcon,
  GraduationCapIcon,
  NewspaperIcon,
  SparklesIcon,
} from "lucide-react";

const config = {
  welcomeScreen: {
    tabs: [
      {
        title: "Create",
        items: [
          "Write a short story about...",
          "Generate a marketing slogan for a new coffee shop",
          "Draft a poem about the changing seasons",
          "Write a blog post about the latest tech trends",
        ],
        icon: SparklesIcon,
      },
      {
        title: "Explore",
        items: [
          "Good books for fans of Rick Rubin",
          "Interesting documentaries about space exploration",
          "Hidden gems in historical fiction",
          "Philosophical concepts related to artificial intelligence",
        ],
        icon: NewspaperIcon,
      },
      {
        title: "Code",
        items: [
          "Write Hello world in Python",
          "Explain the concept of recursion with a JavaScript example",
          "How to set up a basic React component",
          "Write a SQL query to join two tables",
        ],
        icon: CodeIcon,
      },
      {
        title: "Learn",
        items: [
          "Beginner's guide to TypeScript",
          "Fundamental principles of quantum mechanics explained simply",
          "A quick overview of blockchain technology",
          "How to improve public speaking skills",
        ],
        icon: GraduationCapIcon,
      },
    ],
    default: ["How does mrkrbt.chat work?", "Is mrkrbt.chat open-source?", "How many Ts are in the word \"T3Chat\"?", "What is the meaning of code?"],
  },
};

export default config;
