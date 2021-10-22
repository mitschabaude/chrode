// execute this script on the command line with `./cli.js example.js`
import Worker from './example.worker.js';
// import {sum} from './example.wat';
console.log('hello world!');

let worker = new Worker();
worker.onmessage = ({data}) => console.log(data);

let res = await fetch('./package.json');
let packageJson = await res.json();
console.warn('Your package name:', packageJson.name);

// console.log('sum:', await sum(new Uint8Array([1, 2, 3, 4])));

// intentional error
undefined.wtf;
