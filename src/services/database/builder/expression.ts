// use full for running raw expressions

class Expression {
  /**
   * The raw expression value
   * @type {string}
   */
  public value;
  /**
   * Creates an instance of the expression class
   * @param {string} value
   */
  constructor(value: string) {
    this.value = value;
  }
  /**
   * The string representation of this class
   */
  toString() {
    return this.value;
  }
}

export default Expression;
