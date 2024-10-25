import * as tf from '@tensorflow/tfjs-node';
import { WebSocket } from 'ws';
import { DistributedModel } from './model';
import { DataProcessor } from './data-processor';
import { ModelConfig, NodeMetrics, GradientUpdate } from './types';
import { compress, decompress } from './utils/compression';

export class NodeManager {
    private model: DistributedModel;
    private dataProcessor: DataProcessor;
    private ws: WebSocket;
    private nodeId: string;
    private metrics: NodeMetrics;
    private trainingActive: boolean = false;

    constructor(
        modelConfig: ModelConfig,
        private orchestratorUrl: string
    ) {
        this.model = new DistributedModel(modelConfig);
        this.dataProcessor = new DataProcessor();
        this.nodeId = crypto.randomUUID();
        this.metrics = this.initializeMetrics();
        this.setupWebSocket();
    }

    private initializeMetrics(): NodeMetrics {
        return {
            accuracy: 0,
            loss: 0,
            bandwidth: 0,
            latency: 0,
            gradientSize: 0
        };
    }

    private setupWebSocket() {
        this.ws = new WebSocket(this.orchestratorUrl);

        this.ws.on('open', () => {
            console.log(`Node ${this.nodeId} connected to orchestrator`);
            this.registerNode();
        });

        this.ws.on('message', async (data: Buffer) => {
            const message = JSON.parse(data.toString());
            await this.handleMessage(message);
        });

        this.ws.on('close', () => {
            console.log(`Node ${this.nodeId} disconnected from orchestrator`);
            setTimeout(() => this.setupWebSocket(), 5000);
        });
    }

    private async handleMessage(message: any) {
        switch (message.type) {
            case 'START_TRAINING':
                await this.startTraining(message.data);
                break;
            case 'STOP_TRAINING':
                this.stopTraining();
                break;
            case 'UPDATE_MODEL':
                await this.updateModel(message.data);
                break;
            case 'REQUEST_METRICS':
                this.sendMetrics();
                break;
        }
    }

    private async startTraining(config: any) {
        this.trainingActive = true;
        
        while (this.trainingActive) {
            const startTime = Date.now();
            
            // Local training iteration
            const { gradients, metrics } = await this.trainIteration();
            
            // Compress gradients
            const compressedGradients = await compress(gradients);
            
            // Update metrics
            this.metrics = {
                ...metrics,
                latency: Date.now() - startTime,
                gradientSize: compressedGradients.byteLength
            };

            // Send update to orchestrator
            this.sendGradientUpdate(compressedGradients);
            
            // Wait for next iteration
            await new Promise(resolve => setTimeout(resolve, config.intervalMs));
        }
    }

    private async trainIteration(): Promise<{ gradients: Float32Array[]; metrics: Partial<NodeMetrics> }> {
        return tf.tidy(() => {
            // Simulate local training and return gradients
            const gradients = Array.from({ length: 10 }, () => 
                new Float32Array(1000).map(() => Math.random() - 0.5)
            );

            return {
                gradients,
                metrics: {
                    accuracy: Math.random() * 0.2 + 0.8,
                    loss: Math.random() * 0.3
                }
            };
        });
    }

    private sendGradientUpdate(compressedGradients: ArrayBuffer) {
        const update: GradientUpdate = {
            nodeId: this.nodeId,
            gradients: Array.from(new Float32Array(compressedGradients)),
            iteration: Date.now(),
            metrics: this.metrics
        };

        this.ws.send(JSON.stringify({
            type: 'GRADIENT_UPDATE',
            data: update
        }));
    }

    private async updateModel(modelData: ArrayBuffer) {
        const decompressedWeights = await decompress(modelData);
        await this.model.loadWeights(decompressedWeights);
    }

    private stopTraining() {
        this.trainingActive = false;
    }

    private sendMetrics() {
        this.ws.send(JSON.stringify({
            type: 'METRICS_UPDATE',
            data: this.metrics
        }));
    }

    private registerNode() {
        this.ws.send(JSON.stringify({
            type: 'REGISTER_NODE',
            data: {
                nodeId: this.nodeId,
                capabilities: {
                    gpu: tf.getBackend() === 'webgl',
                    memory: process.memoryUsage().heapTotal,
                    cores: navigator.hardwareConcurrency
                }
            }
        }));
    }
}