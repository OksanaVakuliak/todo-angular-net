import { Category } from '../categories/category.models';
import { TaskItem } from './task.models';

export function buildTaskCardColorRules(tasks: TaskItem[], categories: Category[]): string[] {
  return tasks
    .filter((task) => task.categoryId && isHexColor(getTaskCategoryColor(task, categories)))
    .map((task) => {
      const background = normalizeHexColor(getTaskCategoryColor(task, categories) as string);
      const textColor = getReadableTextColor(background);
      const className = toCssIdentifier(task.id);

      return `.task-item.task-card-${className}{--task-card-bg:${background};--task-card-text:${textColor};--task-card-muted:${textColor};background:${background};border-color:${background};}`;
    });
}

export function getTaskCardColorClass(task: TaskItem, categories: Category[]): string {
  return task.categoryId && getTaskCategoryColor(task, categories)
    ? `task-card-${toCssIdentifier(task.id)}`
    : 'task-category-empty';
}

function getReadableTextColor(background: string): '#111827' | '#ffffff' {
  const darkText = '#111827';
  const lightText = '#ffffff';
  const darkContrast = getContrastRatio(background, darkText);
  const lightContrast = getContrastRatio(background, lightText);

  return darkContrast >= lightContrast ? darkText : lightText;
}

function getContrastRatio(firstColor: string, secondColor: string): number {
  const firstLuminance = getRelativeLuminance(firstColor);
  const secondLuminance = getRelativeLuminance(secondColor);
  const lighter = Math.max(firstLuminance, secondLuminance);
  const darker = Math.min(firstLuminance, secondLuminance);

  return (lighter + 0.05) / (darker + 0.05);
}

function getRelativeLuminance(color: string): number {
  const normalizedColor = color.replace('#', '');
  const red = Number.parseInt(normalizedColor.slice(0, 2), 16);
  const middleChannel = Number.parseInt(normalizedColor.slice(2, 4), 16);
  const blue = Number.parseInt(normalizedColor.slice(4, 6), 16);
  const [linearRed, linearMiddle, linearBlue] = [red, middleChannel, blue].map((channel) => {
    const value = channel / 255;

    return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });

  return 0.2126 * linearRed + 0.7152 * linearMiddle + 0.0722 * linearBlue;
}

function getTaskCategoryColor(task: TaskItem, categories: Category[]): string | null {
  if (isHexColor(task.categoryColor)) {
    return task.categoryColor;
  }

  return categories.find((category) => category.id === task.categoryId)?.color ?? null;
}

function isHexColor(value: string | null): value is string {
  return /^#?[\da-f]{6}$/i.test(value ?? '');
}

function normalizeHexColor(value: string): string {
  return value.startsWith('#') ? value : `#${value}`;
}

function toCssIdentifier(value: string): string {
  return value.replace(/[^\da-z]/gi, '');
}
