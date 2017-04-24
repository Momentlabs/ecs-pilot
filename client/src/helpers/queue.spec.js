import Queue from './queue';
import expect from 'expect';


describe('Queue', () => {

  describe('with an empty queue', () => {

    it('should return undefined on an access.', () => {
      let q = new Queue;
      expect(q.peek()).toEqual(undefined);
    });

    it('should have zero length', () => {
      let q = new Queue;
      expect(q.length()).toEqual(0);
    });

    const tests = [1,2,3, "hello", {key: "key", value: 1}];

    it('should add a single element and peek should find it.', () => {
      tests.forEach((a) => {
        let q = new Queue;
        q.add(a);
        expect(q.peek()).toEqual(a);
      });
    });

    it('adding an element then calling remove() should find it and take it from the queue', () => {
      tests.forEach( (a) => {
        let q = new Queue;
        q.add(a);
        expect(q.remove()).toEqual(a);
        expect(q.length()).toEqual(0);
      });
    });

    it('add(e) and then remove(e) should empty the queue.', () => {
      tests.forEach( (a) => {
        let q = new Queue;
        q.add(a);
        q.remove(a);
        expect(q.length()).toEqual(0);
        expect(q.toArray.length).toEqual(0);
      });
    });

    it('add(e) and the remove(func) should remove the element from the queue', () => {
      tests.forEach( (a) => {
        let q = new  Queue;
        q.add(a);
        q.remove((e) => e !== a);
        expect(q.length()).toEqual(0);
        expect(q.toArray.length).toEqual(0);
      });
    });
  });

  const tests = [[1], [1,2], [1,2,3], [3,2,1]];
  describe('with a variety of queue states', () => {

    it('should return an empty queue on reset', () => {
      let q = new Queue;
      tests.forEach((e) => q.add(e));
      q.reset();
      expect(q.length()).toEqual(0);
      expect(q.peek(0)).toEqual(undefined);
    });

    it('should return all of the items that have been added to it in order', () => {
      tests.forEach((a) => {
        let q = new Queue;
        a.forEach((e) => q.add(e)); // fill the q.
        a.forEach((e) => expect(q.remove()).toEqual(e)); // in the same order remove and check.
      });
    });

    it('should return the first input item', () => {
      tests.forEach((a) => {
        let q = new Queue;
        a.forEach((e) => q.add(e)); 
        const t = a[0]; 
        expect(q.remove()).toEqual(t);
      });
    });

  });

  describe('for Object.assigned copies', () => {

    it('queue should reset without affecting the copy', () => {
      tests.forEach((a) => {
        let q = new Queue;
        a.forEach((e) => q.add(e));
        let q2 = q.copy();
        q.reset();
        expect(q2.length()).toNotEqual(0);
      });
    });

    it('queue should remove() without affecting the copy', () => {
      tests.forEach((a) => {
        let q = new Queue;
        a.forEach((e) => q.add(e));
        // let q2 = Object.assign(new Queue, q);
        let q2 = q.copy();
        while( q.remove() > 0);
        expect(q2.length()).toNotEqual(0);
      });
    });
  });
});


