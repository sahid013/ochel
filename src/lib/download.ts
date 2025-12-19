/**
 * Downloads a single file from a URL
 */
export const downloadFile = async (url: string, filename: string) => {
    try {
        const response = await fetch(url);
        const blob = await response.blob();
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(link.href);
    } catch (error) {
        console.error(`Error downloading file ${filename}:`, error);
    }
};

/**
 * Downloads multiple files sequentially
 */
export const downloadMultipleFiles = async (files: { url: string; filename: string }[]) => {
    for (const file of files) {
        await downloadFile(file.url, file.filename);
        // Small delay to ensure browser handles separate downloads
        await new Promise(resolve => setTimeout(resolve, 500));
    }
};
