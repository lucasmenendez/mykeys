import { LoadedFile, LoadedFileSource } from "~/state/AppState";

export async function fileToLoadedFile(
    source: LoadedFileSource,
    file: File,
): Promise<LoadedFile | undefined> {
    if (file.size === 0) return undefined;

    const content = await file.text();
    if (!content) return undefined;

    return { source, name: file.name, size: file.size, content };
}

export function textToLoadedFile(
    source: LoadedFileSource,
    content: string,
): LoadedFile | undefined {
    if (content.length === 0) return undefined;

    return {
        source,
        size: new TextEncoder().encode(content).length,
        content,
    };
}
