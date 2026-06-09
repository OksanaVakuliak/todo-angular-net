export function toDueAtIsoString(dueDate: Date | null): string | null {
  if (!dueDate) {
    return null;
  }

  const date = new Date(Date.UTC(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate()));

  return date.toISOString();
}

export function toDateControlValue(value: Date): Date {
  return new Date(value.getFullYear(), value.getMonth(), value.getDate());
}
