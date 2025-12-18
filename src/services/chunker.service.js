export function chunkText(text, chunkSize = 300, overlap = 50) {
    const words = text.split(" ");
    const chunks = [];

    let start = 0;
    while (start < words.length) {
        const end = start + chunkSize;
        const chunk = words.slice(start, end).join(" ");
        chunks.push(chunk);
        start = end - overlap;
        if (start < 0) start = 0;
    }

    return chunks;
}
