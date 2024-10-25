import * as tf from '@tensorflow/tfjs-node';
import { promises as fs } from 'fs';

export class DataProcessor {
    private dataNormalizer: tf.LayersModel;

    constructor() {
        this.dataNormalizer = this.buildNormalizer();
    }

    private buildNormalizer(): tf.LayersModel {
        const normalizer = tf.sequential();
        normalizer.add(tf.layers.normalization({
            axis: -1,
            inputShape: [undefined]
        }));
        return normalizer;
    }

    async loadDataset(path: string): Promise<{ features: tf.Tensor; labels: tf.Tensor }> {
        const rawData = await fs.readFile(path, 'utf-8');
        const data = JSON.parse(rawData);
        
        // Convert data to tensors
        const features = tf.tensor2d(data.features);
        const labels = tf.tensor2d(data.labels);

        // Normalize features
        const normalizedFeatures = this.normalizeFeatures(features);

        return {
            features: normalizedFeatures,
            labels
        };
    }

    private normalizeFeatures(features: tf.Tensor): tf.Tensor {
        return tf.tidy(() => {
            const mean = features.mean(0);
            const std = features.sub(mean).square().mean(0).sqrt();
            return features.sub(mean).div(std);
        });
    }

    splitDataset(
        features: tf.Tensor,
        labels: tf.Tensor,
        trainRatio: number = 0.8
    ): { train: { x: tf.Tensor; y: tf.Tensor }; test: { x: tf.Tensor; y: tf.Tensor } } {
        const numExamples = features.shape[0];
        const numTrain = Math.floor(numExamples * trainRatio);

        return {
            train: {
                x: features.slice([0, 0], [numTrain, -1]),
                y: labels.slice([0, 0], [numTrain, -1])
            },
            test: {
                x: features.slice([numTrain, 0], [-1, -1]),
                y: labels.slice([numTrain, 0], [-1, -1])
            }
        };
    }

    createBatches(
        features: tf.Tensor,
        labels: tf.Tensor,
        batchSize: number
    ): Array<{ x: tf.Tensor; y: tf.Tensor }> {
        const numBatches = Math.ceil(features.shape[0] / batchSize);
        const batches = [];

        for (let i = 0; i < numBatches; i++) {
            const start = i * batchSize;
            const end = Math.min(start + batchSize, features.shape[0]);

            batches.push({
                x: features.slice([start, 0], [end - start, -1]),
                y: labels.slice([start, 0], [end - start, -1])
            });
        }

        return batches;
    }

    async saveProcessedData(
        data: { features: tf.Tensor; labels: tf.Tensor },
        path: string
    ): Promise<void> {
        const serialized = {
            features: await data.features.array(),
            labels: await data.labels.array()
        };

        await fs.writeFile(path, JSON.stringify(serialized));
    }
}