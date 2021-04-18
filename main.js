'use strict'

const input = document.getElementById('file'),
    error = document.querySelector('.error'),
    button = document.getElementById('processing'),
    linkWrap = document.querySelector('.downloadlink'),
    limit = 2**53 - 1;

let file, arr = [], lastArr;

const readFile = () => {

    const promise = new Promise((resolve, reject) => {
        
        file = input.files[0];
        let reader = new FileReader();

        if(file){
            reader.readAsText(file); 
        }

        reader.onload = function() {
           resolve(reader.result.split('\n')
                    .map(item => item.replace(/[\r]/, '').trim()));
        };

        reader.onerror = function(){
            reject('Error loading');
        }
    });
      
   return promise;
}

const toNumArray = (arr) => {
    let newArray = []; //массив с массивами чисел

    arr.forEach(item => {

        item = item.split(' ').map(item => +item);
        newArray.push(item);
    });

    return newArray;
}

//валидация
const validator = (arr) => {

    let regexp = /^(\+?|\-?)\d+ +(\+?|\-?)\d+$/;
    let tempArr = arr.map(item => regexp.test(item));
    return tempArr.every((item) => item === true);
}

//лимит
//callback
const checkLimit = (arr) => {
    return toNumArray(arr).every((item) => 
            item.every(item => (-limit < item) && (limit > item)));
}

const filterArray = (arr) => {
            
    arr.forEach(item => {
        for(let i = 0; i < arr.length; i++){
            if(arr[i][0] === item[0]){
                if(arr.indexOf(item) !== arr.indexOf(arr[i])){
                    arr.splice(arr.indexOf(arr[i]), 1);
                }
            }
        }
    });

    return arr;
}

const toFormat = (arr) => {
    arr = arr.map(item => item.join(" "));

    return arr.join('\n');;
}

const gnomeSort = (arr) => {

    const l = arr.length;
    let i = 1;

    while (i < l) {
        if (i > 0 && arr[i - 1][0] > arr[i][0]) {
            [arr[i], arr[i - 1]] = [arr[i - 1], arr[i]];
            i--;
        } else {
            i++;
        }
    }    
    
    return arr;
};

const createNewFile =  (text) => {
    let textFile = null;
    let data = new Blob([text], {type: 'text/plain'});

    if (textFile !== null) {
        window.URL.revokeObjectURL(textFile);
    }

    textFile = window.URL.createObjectURL(data);
    return textFile;
};

const showLink = (text) => {
    linkWrap.querySelector('a').href = text;
    linkWrap.style.display = 'block';
}

button.addEventListener('click', () => {
    
    error.style.display = 'none';
    linkWrap.style.display = 'none';

    async function foo() {
        let arr = await readFile().then(result => result, reason => new Error(reason)); //????????

        let promise = new Promise((resolve) => {
            if(validator(arr) && checkLimit(arr)){
                resolve(toNumArray(arr));
            } else {
                throw new Error('Incorrect data format. Try again!');
            }});

        let res = await promise;
        let firstResult = await filterArray(res);
        let newResult = await gnomeSort(firstResult);
        let finalResult = await toFormat(newResult);
        let text = await createNewFile(finalResult);
        await showLink(text); 
    }
    
    foo().catch((err) => {
        error.querySelector('p').innerText = err;
        error.style.display = 'block';
    }); 
});
