import * as tf from '@tensorflow/tfjs-node';
import { ModelConfig } from './types';

export class DistributedModel {
    private model: tf.LayersModel;
    private config: ModelConfig;

    constructor(config: ModelConfig) {
        this.config = config;
        this.model = this.buildModel();
    }

    private buildModel(): tf.LayersModel {
        const model = tf.sequential();

        // Input layer
        model.add(tf.layers.dense({
            units: 128,
            activation: 'relu',
            inputShape: [this.config.inputFeatures]
        }));

        // Hidden layers
        model.add(tf.layers.dropout({ rate: 0.3 }));
        model.add(tf.layers.dense({ units: 64, activation: 'relu' }));
        model.add(tf.layers.dropout({ rate: 0.2 }));
        model.add(tf.layers.dense({ units: 32, activation: 'relu' }));

        // Output layer
        model.add(tf.layers.dense({
            units: this.config.outputClasses,
            activation: 'softmax'
        }));

        model.compile({
            optimizer: tf.train.adam(0.001),
            loss: 'categoricalCrossentropy',
            metrics: ['accuracy']
        });

        return model;
    }

    async train(data: tf.Tensor, labels: tf.Tensor, epochs: number = 10): Promise<tf.History> {
        return await this.model.fit(data, labels, {
            epochs,
            batchSize: 32,
            validationSplit: 0.2,
            callbacks: {
                onEpochEnd: (epoch, logs) => {
                    console.log(`Epoch ${epoch + 1}: loss = ${logs?.loss.toFixed(4)}, accuracy = ${logs?.acc.toFixed(4)}`);
                }
            }
        });
    }

    async predict(input: tf.Tensor): Promise<tf.Tensor> {
        return this.model.predict(input) as tf.Tensor;
    }

    async saveWeights(): Promise<ArrayBuffer> {
        const weights = await this.model.getWeights();
        return tf.io.encodeWeights(weights);
    }

    async loadWeights(buffer: ArrayBuffer): Promise<void> {
        const weights = await tf.io.decodeWeights(buffer);
        await this.model.setWeights(Object.values(weights));
    }

    async exportModel(path: string): Promise<void> {
        await this.model.save(`file://${path}`);
    }
}