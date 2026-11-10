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

export type LoadedFileOptions = {
    name?: string;
    bookmarkId?: string;
};

export function textToLoadedFile(
    source: LoadedFileSource,
    content: string,
    options: LoadedFileOptions = {},
): LoadedFile | undefined {
    if (content.length === 0) return undefined;

    return {
        source,
        name: options.name,
        bookmarkId: options.bookmarkId,
        size: new TextEncoder().encode(content).length,
        content,
    };
}
