export function parseInlineMarkdown(text: string): string {
    return text
        .replace(/`([^`\n]+)`/g, '<code>$1</code>')
        .replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
        .replace(/\*\*([\s\S]+?)\*\*/g, '<strong>$1</strong>')
        .replace(/~~([\s\S]+?)~~/g, '<del>$1</del>')
        .replace(/_([\s\S]+?)_/g, '<em>$1</em>')
        .replace(/\^([\s\S]+?)\^/g, '<sup>$1</sup>')
        .replace(/~([\s\S]+?)~/g, '<sub>$1</sub>')
        .replace(/\n/g, '<br>')
}
