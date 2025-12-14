export const chunkText = function chunkText(text, chunkSize = 300, overlap = 50) {

    const words = text.split(" ");
    const chunks = [];

    let i = 0;
    while(i < words.length) {
        const end = i + chunkSize;
        const chunk = words.slice(i, end).join(" ");
        chunks.push(chunk);
        
        i = end - overlap;
        if(i < 0) {
            i = 0;
        }
    }

    return chunks;
}