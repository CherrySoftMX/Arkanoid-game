/**
 * This class handles the key inputs.
 * The class stores the pressed keys in an array,
 * with the last element being the last pressed key.
 * 
 * The purpose of this class is to be a truth source for
 * the current pressed key, because p5's attribute keyCode doesn't store
 * the current pressed key, it stores the newer key event.
 * A key event can be pressed or released, so keyCode will store
 * the newer pressed or released key and that can lead to
 * inaccurate player input.
 * 
 * The developer should use the object exported by this file
 * to read the actual active input.
 * 
 * onKeyPressed() and onKeyReleased() shouldn't be used by the developer.
 */
class KeyInputManager {
  constructor() {
    this.keys = [];
  }

  /**
   * Stores the pressed key.
   * @param {Int} obj.keyCode - The code of the pressed key. 
   */
  onKeyPressed({ keyCode }) {
    this.keys = [...this.keys, keyCode];
  }

  /**
   * Deletes the released key from the array.
   * @param {Int} obj.keyCode - The code of the released key. 
   */
  onKeyReleased({ keyCode }) {
    this.keys = this.keys.filter(key => key !== keyCode);
  }

  /**
   * Returns the newer pressed key. This method can be used
   * by the developer to read accurate user input insted of
   * p5 build-in keyCode property.
   * @returns The current pressed key.
   */
  getLastPressedKey() {
    if (this.keys.length < 1) return 0;
    return this.keys[this.keys.length - 1];
  }

  /**
   * @returns If there is a key being pressed.
   */
  isAKeyPressed() {
    return this.keys.length > 0;
  }

  /**
   * @param {Int} obj.keyCode - The keycode of the key to verify. 
   * @returns If the parameter key is being pressed.
   */
  isKeyPressed({ keyCode }) {
    return this.keys.includes(keyCode);
  }

  /**
   * @param {Int} obj.keyToCheck - The keycode of the key to verify if was pressed after previousKey.
   * @param {Int} obj.previousKey - The keycode of the key you want to compare.
   * @returns If keyToCheck was pressed after previousKey.
   */
  isKeyPressedAfter({ keyToCheck, previousKey }) {
    const keyIndex = this.keys.findIndex(n => n === keyToCheck);
    const beforeKeyIndex = this.keys.findIndex(n => n === previousKey);
    return keyIndex > beforeKeyIndex; 
  }

  /**
   * Compares the parameter keycodes and returns the keycode of the last pressed key.
   * @param {Int} obj.firstKey - The keycode of the first key to compare.
   * @param {Int} obj.secondKey - The keycode of the second key to compare.
   * @returns The keycode of the last pressed key. If none of the keys have been pressed then it returns null.
   */
  getLastPressedKeyBetween({ firstKey, secondKey }) {
    if (this.isKeyPressedAfter({ keyToCheck: firstKey, previousKey: secondKey })) {
      return firstKey;
    } else if (this.isKeyPressedAfter({ keyToCheck: secondKey, previousKey: firstKey })) {
      return secondKey;
    }
    return null;
  }
}

const inputManager = new KeyInputManager();

export { inputManager };
