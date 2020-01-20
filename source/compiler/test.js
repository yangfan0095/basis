const { parse } = require('@babel/parser');
const generate = require('@babel/generator').default;

const code = `let a = 1, b = 2;
function sum(a, b){
     return a + b;
}
sum(a, b);`;
const ast = parse(code);
const output = generate(ast, { /* options */ }, code);

console.log(output)