import expect from 'expect';
import { UUID_KEY, createActionUUID } from './makeActions';

describe("Testing createActionUUID with a single valued argument", () => {

  // it('teseting how arguments work', () => {

  //   const f = (...args) => {
  //     // console.log("# of Arguments: ", args.length);
  //     // console.log("Arugments:", args);
  //     args.forEach( (a, i) => console.log(`arguments[${i}]=${a}`));
  //   };
  //   f(0);
  //   f(1);
  //   f(1,2);
  // });

  const creator = createActionUUID("ACTION_TEST", (value) => value);
  describe("Calling createActionUUID()", () => {
    it('should return a function', () => {
      expect(creator).toBeA("function");
    });
  });

  describe("The function returned by createActionUUID", () =>  {
    it("should create an action with payload and UUID fields", () => {
      const action = creator(1);
      expect(action).toIncludeKeys(["payload", UUID_KEY]);
    });


    const values = [
        1, 2, [2,3], {v1: 1, v2: 2}
    ];
    it("should create an action filled with expected values in payload", () => {
      values.forEach( (v) => {
        const action = creator(v);
        // console.log("");
        // console.log("Action:", action);
        // console.log("action.payload:", action.payload, "Value:", v);
        expect(action.payload).toEqual(v);
      });
    });

    it("should create a UUID in the expexted form", () => {
      values.forEach( (v) => {
        const action = creator(v);
        expect(action[UUID_KEY]).toMatch(/[a-f0-9]{4}(-[a-f0-9]{4}){3}-[a-f0-9]{12}/);
      });
    });
    it("should create unqiue UUIDs for each test.", () => {
      let ids = [];
      values.forEach( (v) => {
        const action = creator(v);
        const id = action[UUID_KEY];
        ids.push(id);
      });
      ids.forEach( (id) => {
        let found = {};
        ids.forEach( (uuid) => {
          expect(found).toExcludeKey(uuid, `found duplicate id${id}`);
          found[uuid] = true;
        });
      });

    });
  });

describe("Testing createACtinUUID with 2 valued arguments for payload.", () => {

  const values = [
    [1,2], ['a', 'b'], [{k1: 1, k2: 2}, {k1:3, k3: 4}]
  ];
  const creator = createActionUUID("ACTION_TEST", (v1, v2) => {return {av1: v1, av2: v2}});

  it("should create an action filled with the multiple values in the payload", () => {
    values.forEach( (v) => {
      const action = creator(v[0], v[1]);
      expect(action.payload.av1).toEqual(v[0]);
      expect(action.payload.av2).toEqual(v[1]);
    });
  });
});
});