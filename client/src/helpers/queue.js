export default class Queue {

  constructor() {
    this.q = [];
  }

  // Adds an element to the queue.
  // returns the new size.
  add(e) {
    this.q.push(e);
    return this.q.length;
  }

  // If no argument is given, then it will remove the
  // element at the opt of the queue and return it.
  // If e is en element, then remove all the elements
  // that === e and will returned undefined.
  // If e is a function, it will be called once for each
  // element in the queue: 1st argument is the element,
  // second argument is the index.
  // return true to keep the element, return false to remove it.
  // In the match cases, it will silently keeps the original array if no
  // element is found matching.
  remove(e=undefined) {
    switch(typeof e) {
      case "function":
        this.q = this.q.filter(e);
        break;
      case "undefined":
        return this.q.shift();
      default: 
        this.q = this.q.filter( (o) => o !== e);
    }
    return undefined;
  }

  // With non argument returns the element at the head of the queue,
  // returns the ith (counting from 0) element if 
  // the argument i is provied.
  peek(i=0) {
    return this.q[i];
  }

  length() {
    return this.q.length;
  }

  // returns the current queue as an array.
  // Top of the queue at array[0], end of queue is array[length-1];
  toArray() {
    return Object.assign([],this.q);
  }

  // empties the queue.
  reset() {
    this.q = [];
  }

  // This is just  shallow copy of the array.
  // but it does create a new queue.
  copy() {
    let nq = new Queue;
    nq.q = Object.assign([], this.q);
    return nq;
  }

}