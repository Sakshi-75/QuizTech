import { db } from '../server/db.js';
import { topics, contentItems, badges } from '../shared/schema.js';

async function seed() {
  console.log('Seeding database...');

  // Create topics
  const topicsData = [
    { name: 'Algorithms', description: 'Sorting, searching, and optimization algorithms' },
    { name: 'Data Structures', description: 'Arrays, trees, graphs, and hash tables' },
    { name: 'System Design', description: 'Scalability, databases, and distributed systems' },
    { name: 'JavaScript', description: 'ES6+, async/await, and modern JavaScript concepts' },
    { name: 'Python', description: 'Python fundamentals and advanced concepts' }
  ];

  const createdTopics = [];
  for (const topic of topicsData) {
    const [created] = await db.insert(topics).values(topic).returning();
    createdTopics.push(created);
    console.log(`Created topic: ${created.name}`);
  }

  // Create lessons
  const lessonsData = [
    {
      type: 'lesson',
      topicId: createdTopics[0].id, // Algorithms
      difficulty: 'beginner',
      title: 'Introduction to Recursion',
      body: 'Recursion is a programming technique where a function calls itself to solve smaller subproblems. It\'s particularly useful for problems that can be broken down into similar, smaller problems.\n\nThe key components of recursion are:\n1. Base case: A condition that stops the recursion\n2. Recursive case: The function calling itself with modified parameters\n\nRecursion is commonly used in tree traversal, mathematical calculations, and divide-and-conquer algorithms.',
      codeSnippet: `function factorial(n) {
  // Base case
  if (n === 0 || n === 1) {
    return 1;
  }
  
  // Recursive case
  return n * factorial(n - 1);
}

console.log(factorial(5)); // Output: 120`,
      explanation: 'Remember to always include a base case to prevent infinite recursion. Think of recursion as breaking a big problem into smaller, similar problems.',
      tags: ['recursion', 'algorithms', 'fundamentals']
    },
    {
      type: 'lesson',
      topicId: createdTopics[1].id, // Data Structures
      difficulty: 'intermediate',
      title: 'Binary Search Trees',
      body: 'A Binary Search Tree (BST) is a hierarchical data structure where each node has at most two children. The left child contains values less than the parent, and the right child contains values greater than the parent.\n\nBSTs provide efficient searching, insertion, and deletion operations with O(log n) average time complexity.\n\nKey properties:\n- Left subtree contains smaller values\n- Right subtree contains larger values\n- No duplicate values (in basic implementation)',
      codeSnippet: `class TreeNode {
  constructor(val) {
    this.val = val;
    this.left = null;
    this.right = null;
  }
}

class BST {
  constructor() {
    this.root = null;
  }
  
  insert(val) {
    if (!this.root) {
      this.root = new TreeNode(val);
      return;
    }
    
    this.insertNode(this.root, val);
  }
  
  insertNode(node, val) {
    if (val < node.val) {
      if (!node.left) {
        node.left = new TreeNode(val);
      } else {
        this.insertNode(node.left, val);
      }
    } else {
      if (!node.right) {
        node.right = new TreeNode(val);
      } else {
        this.insertNode(node.right, val);
      }
    }
  }
}`,
      explanation: 'BSTs maintain sorted order automatically. In-order traversal of a BST gives you elements in sorted order.',
      tags: ['trees', 'data-structures', 'searching']
    }
  ];

  for (const lesson of lessonsData) {
    await db.insert(contentItems).values(lesson);
    console.log(`Created lesson: ${lesson.title}`);
  }

  // Create questions
  const questionsData = [
    {
      type: 'question',
      topicId: createdTopics[0].id, // Algorithms
      difficulty: 'beginner',
      title: 'What is the time complexity of binary search?',
      body: 'Binary search is an efficient algorithm for finding an item from a sorted list. What is its time complexity?',
      options: ['O(n)', 'O(log n)', 'O(n²)', 'O(1)'],
      correctAnswer: 'B',
      explanation: 'Binary search has O(log n) time complexity because it eliminates half of the remaining elements in each step.',
      tags: ['binary-search', 'complexity', 'algorithms']
    },
    {
      type: 'question',
      topicId: createdTopics[1].id, // Data Structures
      difficulty: 'intermediate',
      title: 'Which data structure uses LIFO principle?',
      body: 'LIFO stands for Last In, First Out. Which data structure follows this principle?',
      options: ['Queue', 'Stack', 'Array', 'Linked List'],
      correctAnswer: 'B',
      explanation: 'A stack follows the LIFO principle - the last element added is the first one to be removed.',
      tags: ['stack', 'data-structures', 'principles']
    },
    {
      type: 'question',
      topicId: createdTopics[3].id, // JavaScript
      difficulty: 'beginner',
      title: 'What does the "const" keyword do in JavaScript?',
      body: 'The const keyword is used to declare variables in JavaScript. What is its main characteristic?',
      options: ['Makes variable mutable', 'Creates block-scoped variable that cannot be reassigned', 'Creates global variable', 'Same as var'],
      correctAnswer: 'B',
      explanation: 'const creates a block-scoped variable that cannot be reassigned after initialization.',
      tags: ['javascript', 'variables', 'fundamentals']
    },
    {
      type: 'question',
      topicId: createdTopics[0].id, // Algorithms
      difficulty: 'advanced',
      title: 'What is the space complexity of merge sort?',
      body: 'Merge sort is a divide-and-conquer algorithm. What is its space complexity?',
      options: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'],
      correctAnswer: 'C',
      explanation: 'Merge sort requires O(n) additional space for the temporary arrays used during merging.',
      tags: ['merge-sort', 'complexity', 'algorithms']
    },
    {
      type: 'question',
      topicId: createdTopics[1].id, // Data Structures
      difficulty: 'beginner',
      title: 'What is the main advantage of using a hash table?',
      body: 'Hash tables are widely used data structures. What is their main advantage?',
      options: ['Sorted storage', 'Fast average-case lookup O(1)', 'Memory efficiency', 'Simple implementation'],
      correctAnswer: 'B',
      explanation: 'Hash tables provide O(1) average-case time complexity for search, insert, and delete operations.',
      tags: ['hash-table', 'data-structures', 'performance']
    },
    {
      type: 'question',
      topicId: createdTopics[2].id, // System Design
      difficulty: 'intermediate',
      title: 'What is horizontal scaling?',
      body: 'In system design, there are different approaches to scaling. What is horizontal scaling?',
      options: ['Upgrading hardware', 'Adding more servers', 'Optimizing code', 'Increasing memory'],
      correctAnswer: 'B',
      explanation: 'Horizontal scaling (scaling out) means adding more servers to handle increased load, rather than upgrading existing hardware.',
      tags: ['scaling', 'system-design', 'architecture']
    }
  ];

  for (const question of questionsData) {
    await db.insert(contentItems).values(question);
    console.log(`Created question: ${question.title}`);
  }

  // Create badges
  const badgesData = [
    {
      name: '3-Day Streak',
      description: 'Complete quizzes for 3 consecutive days',
      criteria: 'streak >= 3',
      icon: '🔥'
    },
    {
      name: '7-Day Streak',
      description: 'Complete quizzes for 7 consecutive days',
      criteria: 'streak >= 7',
      icon: '⚡'
    },
    {
      name: 'Perfect Score',
      description: 'Get all questions correct in a quiz',
      criteria: 'score === totalQuestions',
      icon: '🎯'
    },
    {
      name: 'Algorithm Master',
      description: 'Complete 10 algorithm questions',
      criteria: 'algorithm_questions >= 10',
      icon: '🧠'
    },
    {
      name: 'First Quiz',
      description: 'Complete your first quiz',
      criteria: 'quizzes_completed >= 1',
      icon: '🌟'
    }
  ];

  for (const badge of badgesData) {
    await db.insert(badges).values(badge);
    console.log(`Created badge: ${badge.name}`);
  }

  console.log('Database seeded successfully!');
}

seed().catch(console.error);