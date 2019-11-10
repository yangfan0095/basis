// lisp2c simple

/**
 * tokenizer词素生成器
 *
 *  实现 (add 2 (subtract 4 2))   =>   [{ type: 'paren', value: '(' }, ...]
 */
const tokenizer = (input) => {
    let current = 0;
    let tokens = [];
    while (current < input.length) {
        let char = input[current]
        if (char === '(') {
            tokens.push({type: 'paren', value: '('})
            current++;
            continue;
        }

        if (char === ')') {
            tokens.push({type: 'paren', value: ')'});
            current++;
            continue;
        }

        // 排除空格
        let WHITESPACE = /\s/;
        if (WHITESPACE.test(char)) {
            current++;
            continue;
        }

        // 解析数字
        let NUMBERS = /[0-9]/;
        if (NUMBERS.test(char)) {
            let value = '';
            while (NUMBERS.test(char)) {
                value += char;
                char = input[++current];
            }
            tokens.push({type: 'number', value});
            continue;
        }
        // 解析字符串
        if (char === '"') {
            let value = '';
            char = input[++current]; // 对 " 后面的字符串进行遍历  直到再次匹配到 ", 取其中内容作为字符串
            while (char !== '"') {
                value += char;
                char = input[++current];
            }

            // 进到此处的 " 为 第二个" ,
            char = input[++current];
            tokens.push({type: 'string', value});
            continue;
        }
        // 解析方法声明
        let LETTERS = /[a-z]/i;
        if (LETTERS.test(char)) {
            let value = '';
            while (LETTERS.test(char)) {
                value += char;
                char = input[++current];
            }
            tokens.push({type: 'name', value});
            continue;
        }

        // 如果if都不能捕获，则抛出异常
        throw new TypeError(`char cannot be recognized , char is ${char} `);
    }

    return tokens

}

/**
 * 将tokens 转换为一颗语法树
 * 输入
 *  [{ type: 'paren', value: '(' }, ...]
 *  输出
 *  { type: 'Program', body: [...] }
 * @param {Array} tokens
 */

/**
 * example : 输入
 *    tokens :   [
      //     { type: 'paren',  value: '('        },
      //     { type: 'name',   value: 'add'      },
      //     { type: 'number', value: '2'        },
      //     { type: 'paren',  value: '('        },
      //     { type: 'name',   value: 'subtract' },
      //     { type: 'number', value: '4'        },
      //     { type: 'number', value: '2'        },
      //     { type: 'paren',  value: ')'        },
      //     { type: 'paren',  value: ')'        },
      //   ]
 *  输出AST
 * {
    "type": "Program",
    "body": [
        {
            "type": "CallExpression",
            "name": "add",
            "params": [
                {
                    "type": "NumberLiteral",
                    "value": "2"
                }, {
                    "type": "CallExpression",
                    "name": "subtract",
                    "params": [
                        {
                            "type": "NumberLiteral",
                            "value": "4"
                        }, {
                            "type": "NumberLiteral",
                            "value": "2"
                        }
                    ]
                }
            ]
        }
    ]
}

 *
 */
const parser = (tokens) => {
    let current = 0;
    // walk函数 解析一个“（）” 括号内的词素
    let __walk = () => {
        let token = tokens[current];
        if (token.type === 'number') {
            current++;
            return {type: 'NumberLiteral', value: token.value};
        }
        if (token.type === 'string') {
            current++;
            return {type: 'StringLiteral', value: token.value};
        }
        // 遇到 CallExpression 类型
        if (token.type === 'paren' && token.value === '(') {
            // '('无意义 更新current 和 token
            token = tokens[++current];

            // 当前 CallExpression 的树结构， 内部的词素 都将放入params中
            let node = {
                type: 'CallExpression',
                name: token.value,
                params: []
            };

            token = tokens[++current]; //跳过函数名 因为lisp 执行到（ 就表示函数，（对应的node 包含了 name 所以需要跳过函数名，

            while (token.type !== 'paren' || (token.type === 'paren' && token.value !== ')')) {
                let innerItem = __walk()
                node
                    .params
                    .push(innerItem); //递归执行当前  CallExpression 内部的结构
                token = tokens[current];
            }
            current++; //
            return node
        }
        throw new TypeError(token.type); // 没有匹配的token.type 抛出异常
    }

    let AST = {
        type: 'Program',
        body: []
    }
    while (current < tokens.length) {
        AST
            .body
            .push(__walk());
    }

    return AST
}

/**
 * 
 *
 * @param {*} ast
 * @param {*} visitor
 */
const traverser = (ast, visitor) => {
    // 遍历当前AST数组结构下的类型， 对每一个类型 调用traverseNode进行转换
    let __traverseArray = (array, parent) => {
        array.forEach(child => {
            traverseNode(child, parent);
        });
    }
    let __traverseNode = (node, parent)=> {
        let methods = visitor[node.type];

        if (methods && methods.enter) {
            methods.enter(node, parent);
          }

    }

}

const transformer = ()=>{
    
}

module.exports = {
    tokenizer,
    parser
}