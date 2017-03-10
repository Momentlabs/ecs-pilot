import { mergeStyles } from './ui';
import expect from 'expect';

describe('mergeStyles', () => {
  const empty = {};

  const emptyMergeKey= {
    container: {
      margin: "1em",
      padding: ".5em"
    }
  };

  const simpleTestItem = {
    width: "10em",
    height: 100
  };

  const simpleMergeItem = {
    container: {
      width: "10em",
      height: 100
    }
  };

  const newMergeItem = {
    width: "5em"
  };

  const newAddMergeItem = {
    paddingLeft: "10px"
  };

  const newSimpleMergedItem = {
    width: "5em",
    height: 100
  }

  const newSimpleAddMergedItem  = {
    width: "10em",
    height: 100,
    paddingLeft: "10px"
  }

  const newMergedItem = {
    container: {
      width: "5em",
      height: 100
    }
  };

  const newMergedAddItem = {
    container: {
      width: "10em",
      height: 100,
      paddingLeft: "10px"
    }
  }

  describe('with empty original', () => {

    it('should merge in an empty return empty', () => {
      expect(mergeStyles(empty, empty)).toEqual(empty);
    });

    it('should merge a style and return the style', () => {
      expect(mergeStyles(empty, simpleTestItem)).toEqual(simpleTestItem);
    });

  });

  describe('with an original with no sub styles (no keyToMergeTo target', () => {

    it('should merge an empty return the original', () => {
      expect(mergeStyles(simpleTestItem, empty)).toEqual(simpleTestItem);
    });

    it('should merge a duplicate of original and return the orginal', () => {
      expect(mergeStyles(simpleTestItem, simpleTestItem)).toEqual(simpleTestItem);
    });

    it('should merge a new item overwritting the original and return original with the overwritten value', () =>  {
      expect(mergeStyles(simpleTestItem, newMergeItem)).toEqual(newSimpleMergedItem);
    });

    it('should merge a new item with new value and return original with the new value', () => {
      expect(mergeStyles(simpleTestItem, newAddMergeItem)).toEqual(newSimpleAddMergedItem);
    });

  });

  describe('with an original with a keyToMergeTo', () => {

    it('should merge an empty and return original', () => {
      expect(mergeStyles(emptyMergeKey, empty, "container")).toEqual(emptyMergeKey);
    });

    it('should merge a duplicate of the item at orginal KeytoMergeTo and retrun the original', () => {
      expect(mergeStyles(simpleMergeItem, simpleTestItem, "container")).toEqual(simpleMergeItem);
    });

    it('should merge a new item overwritting the original, return original overwritten with the overwritten value.', () => {
      expect(mergeStyles(simpleMergeItem, newMergeItem, "container")).toEqual(newMergedItem);
    });

    it('should merge a new item with new value and return original with the new value', () => {
      expect(mergeStyles(simpleMergeItem, newAddMergeItem, "container")).toEqual(newMergedAddItem);
    });

  });

});

