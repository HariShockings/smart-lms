import natural from 'natural';
import fs from 'fs/promises'; // Use promises for cleaner async handling
import path from 'path';
import { fileURLToPath } from 'url';

// Resolve __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize classifier as let to allow reassignment
let classifier = new natural.BayesClassifier();

const saveClassifier = async () => {
  try {
    await new Promise((resolve, reject) => {
      classifier.save(path.join(__dirname, 'classifier.json'), (err) => {
        if (err) {
          console.error('Error saving classifier:', err);
          reject(err);
        } else {
          console.log('Classifier saved successfully');
          resolve();
        }
      });
    });
  } catch (error) {
    throw new Error(`Failed to save classifier: ${error.message}`);
  }
};

const loadClassifier = async () => {
  try {
    const classifierPath = path.join(__dirname, 'classifier.json');
    // Check if classifier file exists
    await fs.access(classifierPath);
    classifier = await new Promise((resolve, reject) => {
      natural.BayesClassifier.load(classifierPath, null, (err, loadedClassifier) => {
        if (err) {
          console.error('Error loading classifier:', err);
          reject(err);
        } else {
          resolve(loadedClassifier);
        }
      });
    });
    console.log('Classifier loaded successfully');
  } catch (error) {
    throw new Error(`Failed to load classifier: ${error.message}`);
  }
};

const loadTrainingData = async () => {
  try {
    // Try loading saved classifier first
    try {
      await loadClassifier();
      return;
    } catch (error) {
      console.log('No saved classifier found, training new classifier...');
    }

    // Load and train from data
    const trainingDataPath = path.join(__dirname, '../training_data/training_data.json');
    let trainingData;
    try {
      trainingData = JSON.parse(await fs.readFile(trainingDataPath, 'utf8'));
    } catch (error) {
      throw new Error(`Failed to read training data from ${trainingDataPath}: ${error.message}`);
    }

    trainingData.forEach(item => {
      if (!item.patterns || !item.intent) {
        console.warn(`Invalid training data item: ${JSON.stringify(item)}`);
        return;
      }
      item.patterns.forEach(pattern => {
        classifier.addDocument(pattern, item.intent);
      });
    });

    classifier.train();
    await saveClassifier();
    console.log('Classifier trained and saved successfully');
  } catch (error) {
    throw new Error(`Failed to load training data: ${error.message}`);
  }
};

const classifyIntent = async (message) => {
  try {
    if (!message || typeof message !== 'string') {
      throw new Error('Invalid message input');
    }
    return classifier.classify(message);
  } catch (error) {
    console.error('Error classifying intent:', error);
    return null;
  }
};

const getResponseForIntent = async (intent) => {
  try {
    const trainingDataPath = path.join(__dirname, '../training_data/training_data.json');
    let trainingData;
    try {
      trainingData = JSON.parse(await fs.readFile(trainingDataPath, 'utf8'));
    } catch (error) {
      throw new Error(`Failed to read training data: ${error.message}`);
    }

    const intentData = trainingData.find(item => item.intent === intent);
    if (intentData && intentData.responses?.length > 0) {
      return intentData.responses[Math.floor(Math.random() * intentData.responses.length)];
    }
    return null;
  } catch (error) {
    console.error('Error getting response for intent:', error);
    return null;
  }
};

const evaluateClassifier = async () => {
  try {
    const testDataPath = path.join(__dirname, '../training_data/test_data.json');
    let testData;
    try {
      await fs.access(testDataPath);
      testData = JSON.parse(await fs.readFile(testDataPath, 'utf8'));
    } catch (error) {
      throw new Error(`Test data file not found at ${testDataPath}: ${error.message}`);
    }

    let correct = 0;
    let total = 0;
    testData.forEach(item => {
      if (!item.patterns || !item.intent) {
        console.warn(`Invalid test data item: ${JSON.stringify(item)}`);
        return;
      }
      item.patterns.forEach(pattern => {
        if (classifier.classify(pattern) === item.intent) correct++;
        total++;
      });
    });

    const accuracy = total > 0 ? (correct / total) * 100 : 0;
    console.log(`Classifier Accuracy: ${accuracy.toFixed(2)}% (${correct}/${total})`);
    return { accuracy, correct, total };
  } catch (error) {
    console.error('Error evaluating classifier:', error);
    throw new Error(`Failed to evaluate classifier: ${error.message}`);
  }
};

export { loadTrainingData, classifyIntent, getResponseForIntent, evaluateClassifier };