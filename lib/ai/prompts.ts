import fs from 'fs/promises';
import path from 'path';

const PROMPTS_DIR = path.join(process.cwd(), 'prompts');

export async function loadPrompt(templateName: string, variables: Record<string, any>): Promise<string> {
  const filePath = path.join(PROMPTS_DIR, `${templateName}.md`);
  
  try {
    let content = await fs.readFile(filePath, 'utf-8');
    
    // Replace {{variable}} placeholders
    for (const [key, value] of Object.entries(variables)) {
      const placeholder = new RegExp(`{{${key}}}`, 'g');
      
      // Handle array/object variables by pretty-printing them
      const replacement = typeof value === 'object' 
        ? JSON.stringify(value, null, 2) 
        : String(value);
        
      content = content.replace(placeholder, replacement);
    }
    
    return content;
  } catch (error) {
    console.error(`Error loading prompt template: ${templateName}`, error);
    throw new Error(`Failed to load prompt template: ${templateName}`);
  }
}
