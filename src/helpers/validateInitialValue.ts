/**
 * The validator function returns
 * - input array for array or object that can be change to a array
 * - [] for other
 *
 * @param {any} initialValue
 *              Value to be validated
 *
 * @return {Array}
 *         input array or [] for wrong input
 *
 * @example
 *        const validatedInitialValue = validateInitialValue(initialValue);
 */
export const validateInitialValue = (initialValue: any): Array<any> => {
  if (typeof initialValue === 'object' && initialValue !== null && !Array.isArray(initialValue)) {
    console.log(
      'you have passed a object when a array is required. It still may work however. Please pass a array.',
    );
    initialValue = [...initialValue]
  }
  if (!Array.isArray(initialValue)) {
    console.log(
      'you really want to break the validation. Please pass a array as parameter. Defaulting to [].',
    )
    initialValue = []
  }

  return initialValue;
};
