export {}

declare global {
  interface JSON {
    rawJSON(text: string): any;
  }
}