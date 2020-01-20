const {tokenizer, parser,transformer,codeGenerator} = require('./lispCompiler')
// const expect = require('chai').expect;

/**-----------------tokenizer test -----------------------**/
/**
 * 测试词法分析器 tokenizer
 * 输入
 * (add 2 (subtract 4 2))
 * 预期输出
 * "{"token":[{"type":"paren","value":"("},{"type":"name","value":"add"},{"type":"number","value":"2"},{"type":"paren","value":"("},{"type":"name","value":"subtract"},{"type":"number","value":"4"},{"type":"number","value":"2"},{"type":"paren","value":")"},{"type":"paren","value":")"}]}"
 */
console.log('测试词法分析器 tokenizer')
const testLisp = '(add 100 100)'
const token = tokenizer(testLisp)
console.log(`tokenizer 结果：`, JSON.stringify({token: token}))

/**-----------------parser test -----------------------**/

/**
 * 输入
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

console.log('测试语法分析器 parser')
const AST = parser(token)
console.log(`语法分析器 生成AST:${JSON.stringify(AST)}`)


/**-----------------transformer test -----------------------**/



console.log('transformer test')
const newAst =  transformer(AST)
console.log(`new Ast`,JSON.stringify(newAst))



/**-----------------codeGenerator test -----------------------**/

console.log(`codeGenerator test `)
const code = codeGenerator(newAst)
console.log(`生成的新的代码：${code}`)


 