export class DataHelpers {
  public static removeFirstOccurrenceOfString(original: string, toRemove: string): string {
    const index = original.indexOf(toRemove);
    if (index === -1) return original;
    return original.slice(0, index) + original.slice(index + toRemove.length);
  }
}
