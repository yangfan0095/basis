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
            tokens.push({ type: 'paren', value: '(' })
            current++;
            continue;
        }

        if (char === ')') {
            tokens.push({ type: 'paren', value: ')' });
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
            tokens.push({ type: 'number', value });
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
            tokens.push({ type: 'string', value });
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
            tokens.push({ type: 'name', value });
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
            return { type: 'NumberLiteral', value: token.value };
        }
        if (token.type === 'string') {
            current++;
            return { type: 'StringLiteral', value: token.value };
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
 * 转换器 传入AST 和AST访问器， 对AST进行遍历 对应的节点调用访问器中对应的方法 进行内容操作
 *
 * @param {*} ast
 * @param {*} visitor
 */
const traverser = (ast, visitor) => {
    // 遍历当前AST数组结构下的类型， 对每一个类型 调用traverseNode进行转换
    var __traverseArray = (array, parent) => {
        array.forEach(child => {
            __traverseNode(child, parent);
        });
    }
    var __traverseNode = (node, parent) => {
        let methods = visitor[node.type];

        if (methods && methods.enter) {
            methods.enter(node, parent);
        }

        switch (node.type) {
            case 'Program':
                __traverseArray(node.body, node);
                break;
            case 'CallExpression':
                __traverseArray(node.params, node);
                break;
            case 'NumberLiteral':
            case 'StringLiteral':
                break;
            default:
                throw new TypeError(node.type);
        }

        if (methods && methods.exit) {
            methods.exit(node, parent);
        }
    }

    // 传入初始化抽象语法树 ， 无根节点 ，传null
    __traverseNode(ast, null);
}

// 节点访问器
const visitor = {
    NumberLiteral: {
        enter (node, parent) {
            parent._context.push({
                type: 'NumberLiteral',
                value: node.value,
            })
        }
    },
    StringLiteral: {
        enter (node, parent) {
            parent._context.push({
                type: 'StringLiteral',
                value: node.value,
            });
        }
    },
    CallExpression: {
        enter (node, parent) {
            let expression = {
                type: 'CallExpression',
                callee: {
                    type: 'Identifier',
                    name: node.name,
                },
                arguments: [],
            }
            node._context = expression.arguments  // 子项遍历， 内容挂载到 arguments 上

            if (parent.type !== 'CallExpression') {
                expression = {
                    type: 'ExpressionStatement',
                    expression: expression,
                }
            }

            parent._context.push(expression); // 将当前 CallExpression 所有子集遍历项 挂载在父级上下文
        }
    }
}
/**
 * transformer 接收lisp抽象语法树 返回新的语法树
 * @param {*} ast 
 */
const transformer = (ast) => {
    let newAst = {
        type: 'Program',
        body: [],
    }

    ast._context = newAst.body;
    traverser(ast, visitor)
    return newAst
}

/**
 * 代码生成器 传入AST节点 ，对节点递归生成对应的代码
 * @param {*} node 
 * 
 * 
 * 
 * 输入：
 * {
    "type":"Program",
    "body":[
        {
            "type":"ExpressionStatement",
            "expression":{
                "type":"CallExpression",
                "callee":{
                    "type":"Identifier",
                    "name":"add"
                },
                "arguments":[
                    {
                        "type":"NumberLiteral",
                        "value":"2"
                    },
                    {
                        "type":"CallExpression",
                        "callee":{
                            "type":"Identifier",
                            "name":"subtract"
                        },
                        "arguments":[
                            {
                                "type":"NumberLiteral",
                                "value":"4"
                            },
                            {
                                "type":"NumberLiteral",
                                "value":"2"
                            }
                        ]
                    }
                ]
            }
        }
    ]
}
 * 输出：
 * add(2, subtract(4, 2))
 * 
 * 
 */
const codeGenerator = (node) => {
    switch (node.type) {
        case 'Program':
            return node.body.map(codeGenerator).join('\n');
        case 'ExpressionStatement':
            return codeGenerator(node.expression) + ';';
        case 'CallExpression':
            return (
                codeGenerator(node.callee) +
                '(' +
                node.arguments.map(codeGenerator).join(', ') +
                ')'
            );
        case 'Identifier':
            return node.name;
        case 'NumberLiteral':
            return node.value;
        case 'StringLiteral':
            return '"' + node.value + '"';
        default:
            throw new TypeError(node.type);
    }
}

module.exports = {
    tokenizer,
    parser,
    transformer,
    codeGenerator
}