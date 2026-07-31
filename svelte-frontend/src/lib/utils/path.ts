export function dirname(filePath: string): string {
    return filePath.replace(/[\\/][^\\/]+$/, '');
}