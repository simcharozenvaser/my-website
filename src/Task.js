export class Task {
  constructor(text) {
    this.id = Date.now().toString();
    this.text = text;
    this.completed = false;
  }
}