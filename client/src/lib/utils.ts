import { ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(timestamp: number): string {
  const now = new Date();
  const date = new Date(timestamp);
  
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) {
    return 'just now';
  } else if (diffMins < 60) {
    return `${diffMins}m ago`;
  } else if (diffHours < 24) {
    return `${diffHours}h ago`;
  } else if (diffDays < 7) {
    return `${diffDays}d ago`;
  } else {
    // Format as MM/DD/YYYY
    return date.toLocaleDateString();
  }
}

export function formatMessageContent(content: string): string {
  // Very basic formatting to handle the most common markdown elements
  let formatted = content;
  
  // Convert code blocks (```code```)
  formatted = formatted.replace(
    /```([\s\S]*?)```/g, 
    '<pre class="bg-gray-100 dark:bg-gray-700 p-3 rounded my-2 overflow-x-auto"><code>$1</code></pre>'
  );
  
  // Convert inline code (`code`)
  formatted = formatted.replace(
    /`([^`]+)`/g, 
    '<code class="bg-gray-100 dark:bg-gray-700 px-1 rounded">$1</code>'
  );
  
  // Convert bold (**text**)
  formatted = formatted.replace(
    /\*\*([^*]+)\*\*/g, 
    '<strong>$1</strong>'
  );
  
  // Convert italic (*text*)
  formatted = formatted.replace(
    /\*([^*]+)\*/g, 
    '<em>$1</em>'
  );
  
  // Convert lists
  // Ordered lists
  formatted = formatted.replace(
    /(?:^|\n)(\d+\.\s[^\n]+)(?:\n|$)/g,
    (match) => {
      const listItems = match.trim().split('\n');
      const listHTML = listItems.map(item => `<li>${item.replace(/^\d+\.\s/, '')}</li>`).join('');
      return `<ol class="list-decimal pl-5 my-2">${listHTML}</ol>`;
    }
  );
  
  // Unordered lists
  formatted = formatted.replace(
    /(?:^|\n)(-\s[^\n]+)(?:\n|$)/g,
    (match) => {
      const listItems = match.trim().split('\n');
      const listHTML = listItems.map(item => `<li>${item.replace(/^-\s/, '')}</li>`).join('');
      return `<ul class="list-disc pl-5 my-2">${listHTML}</ul>`;
    }
  );
  
  // Convert paragraphs
  formatted = formatted.replace(/\n\n/g, '</p><p class="my-2">');
  formatted = `<p class="my-2">${formatted}</p>`;
  
  return formatted;
}
