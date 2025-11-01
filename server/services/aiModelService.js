import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class AIModelService {
  constructor() {
    this.pythonPath = 'python3';
    this.predictScriptPath = path.join(__dirname, '..', 'ai', 'predictModel.py');
    this.modelDir = path.join(__dirname, '..', 'ai', 'models');
  }

  async isModelAvailable() {
    try {
      const metadataPath = path.join(this.modelDir, 'model_metadata.json');
      await fs.access(metadataPath);
      return true;
    } catch (error) {
      return false;
    }
  }

  async getModelMetadata() {
    try {
      const metadataPath = path.join(this.modelDir, 'model_metadata.json');
      const data = await fs.readFile(metadataPath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error reading model metadata:', error);
      return null;
    }
  }

  async predictImage(imagePath) {
    return new Promise((resolve, reject) => {
      const pythonProcess = spawn(this.pythonPath, [this.predictScriptPath, imagePath]);
      let outputData = '';
      let errorData = '';

      pythonProcess.stdout.on('data', (data) => {
        outputData += data.toString();
      });

      pythonProcess.stderr.on('data', (data) => {
        errorData += data.toString();
      });

      pythonProcess.on('close', (code) => {
        if (code !== 0) {
          reject(new Error(`Prediction failed: ${errorData}`));
          return;
        }
        resolve(this.parseOutput(outputData));
      });
    });
  }

  parseOutput(output) {
    const lines = output.split('\n');
    let category = null;
    let confidence = null;
    let department = null;

    for (const line of lines) {
      if (line.includes('Category:')) category = line.split('Category:')[1].trim();
      if (line.includes('Confidence:')) {
        const match = line.match(/(\d+\.?\d*)%/);
        if (match) confidence = parseFloat(match[1]);
      }
      if (line.includes('Department:')) department = line.split('Department:')[1].trim();
    }

    if (category && confidence && department) {
      return {
        success: true,
        category,
        confidence: confidence / 100,
        department
      };
    }

    return { success: false, error: 'Could not parse prediction' };
  }
}

export default new AIModelService();
