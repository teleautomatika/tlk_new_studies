import { deflate, inflate } from 'pako';

export async function compress(data: Float32Array[]): Promise<ArrayBuffer> {
    // Convert gradients to binary format
    const concatenated = new Float32Array(
        data.reduce((acc, arr) => acc + arr.length, 0)
    );
    
    let offset = 0;
    for (const arr of data) {
        concatenated.set(arr, offset);
        offset += arr.length;
    }

    // Compress using deflate
    return deflate(new Uint8Array(concatenated.buffer)).buffer;
}

export async function decompress(data: ArrayBuffer): Promise<Float32Array[]> {
    // Decompress data
    const decompressed = inflate(new Uint8Array(data));
    
    // Convert back to Float32Array
    const float32Data = new Float32Array(
        decompressed.buffer,
        decompressed.byteOffset,
        decompressed.length / 4
    );

    // Split into original arrays (assuming fixed size for simplicity)
    const gradientSize = float32Data.length / 10; // 10 layers
    const gradients: Float32Array[] = [];
    
    for (let i = 0; i < 10; i++) {
        gradients.push(
            float32Data.slice(i * gradientSize, (i + 1) * gradientSize)
        );
    }

    return gradients;
}