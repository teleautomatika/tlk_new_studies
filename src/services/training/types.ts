export interface ModelConfig {
    inputFeatures: number;
    outputClasses: number;
    hiddenLayers: number[];
    learningRate: number;
}

export interface TrainingConfig {
    epochs: number;
    batchSize: number;
    validationSplit: number;
}

export interface NodeMetrics {
    accuracy: number;
    loss: number;
    bandwidth: number;
    latency: number;
    gradientSize: number;
}

export interface GradientUpdate {
    nodeId: string;
    gradients: Float32Array[];
    iteration: number;
    metrics: NodeMetrics;
}

export interface ModelUpdate {
    version: number;
    weights: ArrayBuffer;
    metrics: {
        globalAccuracy: number;
        participatingNodes: number;
        timestamp: number;
    };
}