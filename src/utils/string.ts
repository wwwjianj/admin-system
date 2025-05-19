/**
 * 递增字符串中的数字部分
 * @param str 要递增的字符串
 * @param padLength 数字部分的长度，用于补零
 * @returns 递增后的字符串
 *
 * @example
 * incrementString('ABC001') // 'ABC002'
 * incrementString('001') // '002'
 * incrementString('ABC999') // 'ABC1000'
 */
export const incrementString = (str: string, padLength?: number): string => {
  // 匹配字符串末尾的数字部分
  const match = str.match(/(\d+)$/);

  if (!match) {
    // 如果没有数字部分，直接在末尾添加1
    return str + "1";
  }

  const [fullMatch, numberStr] = match;
  const prefix = str.slice(0, str.length - fullMatch.length);
  const number = parseInt(numberStr, 10);
  const nextNumber = number + 1;

  if (padLength !== undefined) {
    // 如果指定了长度，使用前导零填充
    return prefix + nextNumber.toString().padStart(padLength, "0");
  }

  // 如果没有指定长度，保持原始数字的位数
  return prefix + nextNumber.toString().padStart(numberStr.length, "0");
};

/**
 * 生成ptrgic开头的递增字符串
 * @param number 起始数字
 * @param padLength 数字部分的长度，用于补零
 * @returns ptrgic + 递增的数字
 *
 * @example
 * generatePtrgic(1) // 'ptrgic001'
 * generatePtrgic(10, 4) // 'ptrgic0010'
 */
export const generatePtrgic = (
  number: number,
  padLength: number = 3
): string => {
  return `ptrgic${number.toString().padStart(padLength, "0")}`;
};

// 用于存储每个字符串的计数器
const counters: Record<string, number> = {};

/**
 * 生成带下划线和递增数字的字符串
 * @param str 基础字符串
 * @returns 基础字符串_递增数字
 *
 * @example
 * generateWithNumber('str') // 'str_0'
 * generateWithNumber('str') // 'str_1'
 * generateWithNumber('ms')  // 'ms_0'
 */
export const generateWithNumber = (str: string): string => {
  if (!counters[str]) {
    counters[str] = 0;
  }
  const result = `${str}_${counters[str]}`;
  counters[str]++;
  return result;
};

const countStr = (str: string): string => {
  let obj: any = {};
  if (obj[str]) {
    obj[str] = obj[str] + 1;
  } else {
    obj[str] = 0;
  }

  return str + "_" + obj.str;
};

const res = countStr("str"); // str_0
const res1 = countStr("str"); // str_1
const res2 = countStr("str"); // str_2
const res8 = countStr("ms"); // ms_0
console.log(res, res1, res2);
