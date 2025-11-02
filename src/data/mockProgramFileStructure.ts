import type { FileNode } from './mockFileStructure';

// Mock file structure for programs (TODO: Should be fetched from GET /api/programs/$id/zip)
export const mockProgramFileStructure: FileNode = {
  name: 'program_root',
  type: 'folder',
  children: [
    {
      name: 'data',
      type: 'folder',
      children: [
        {
          name: 'cases',
          type: 'folder',
          children: [
            { 
              name: 'open_data_1.json', 
              type: 'file', 
              content: `{
  "case_id": "case-od1",
  "case_type": "open data",
  "dataset_revision_id": "ds-rev-001",
  "description": "Open Data Case 1: Basic classification task"
}` 
            },
            { 
              name: 'open_exam_1.json', 
              type: 'file', 
              content: `{
  "case_id": "case-oe1",
  "case_type": "open exam",
  "dataset_revision_id": "ds-rev-003",
  "description": "Open Exam 1: Public test set"
}` 
            },
          ],
        },
      ],
    },
    {
      name: 'algos',
      type: 'folder',
      children: [
        {
          name: 'sample',
          type: 'folder',
          children: [
            { 
              name: 'baseline.py', 
              type: 'file', 
              content: `"""
Baseline Sample Algorithm
"""

import numpy as np
from sklearn.ensemble import RandomForestClassifier

def train_model(X_train, y_train):
    """Train a random forest classifier"""
    model = RandomForestClassifier(n_estimators=100, random_state=42)
    model.fit(X_train, y_train)
    return model

def predict(model, X_test):
    """Make predictions"""
    return model.predict(X_test)
` 
            },
          ],
        },
        {
          name: 'eval',
          type: 'folder',
          children: [
            { 
              name: 'accuracy.py', 
              type: 'file', 
              content: `"""
Accuracy Evaluator
"""

from sklearn.metrics import accuracy_score

def evaluate(y_true, y_pred):
    """Calculate accuracy score"""
    return accuracy_score(y_true, y_pred)
` 
            },
            { 
              name: 'f1_score.py', 
              type: 'file', 
              content: `"""
F1 Score Evaluator
"""

from sklearn.metrics import f1_score

def evaluate(y_true, y_pred):
    """Calculate F1 score"""
    return f1_score(y_true, y_pred, average='weighted')
` 
            },
          ],
        },
      ],
    },
    {
      name: 'submissions',
      type: 'folder',
      children: [
        { 
          name: '.gitkeep', 
          type: 'file', 
          content: '# Submissions folder\n\nThis folder contains user submissions.\n' 
        },
      ],
    },
    { 
      name: 'README.md', 
      type: 'file', 
      content: `# Program README

## Overview
This program contains cases, sample code, and evaluation code.

## Structure
- data/cases/: Case definitions
- algos/sample/: Sample algorithm implementations
- algos/eval/: Evaluation scripts
- submissions/: User submission history

## Usage
1. Review cases in data/cases/
2. Check sample implementations in algos/sample/
3. Submit your algorithm through the web interface
4. View results in submissions/

## Evaluation
Submissions are evaluated using scripts in algos/eval/

## Rules
- Follow the API defined in sample code
- Submissions must complete within time limit
- Check leaderboard for rankings
` 
    },
    { 
      name: 'requirements.txt', 
      type: 'file', 
      content: `numpy>=1.21.0
scikit-learn>=1.0.0
pandas>=1.3.0
` 
    },
  ],
};
